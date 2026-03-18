"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { FrequencyPeriod, MembershipStatus } from "@prisma/client";
import { pusherServer } from "@/lib/pusherServer";

const s3Client = new S3Client({
  forcePathStyle: false, 
  endpoint: `https://tor1.digitaloceanspaces.com`, 
  region: "tor1", 
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  }
});

export async function createHabit(
  userId: number, 
  name: string, 
  description?: string,
  isGroup: boolean = false,
  frequencyCount: number = 1,
  frequencyPeriod: FrequencyPeriod = FrequencyPeriod.DAY
) {
  const newHabit = await db.habit.create({
    data: {
      creatorId: userId,
      name: name,
      description: description || "", 
      isGroup: isGroup,
      frequencyCount: frequencyCount,
      frequencyPeriod: frequencyPeriod,
      members: {
        create: {
          userId: userId,
          status: MembershipStatus.ACCEPTED
        }
      }
    },
  });
  
  revalidatePath("/dashboard");
  return newHabit;
}

export async function updateHabit(
  habitId: number,
  userId: number,
  data: { 
    name?: string; 
    description?: string; 
    frequencyCount?: number; 
    frequencyPeriod?: FrequencyPeriod; 
    isGroup?: boolean 
  }
) {
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    include: { members: true }
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  const isMember =
    (habit.creatorId === userId) ||
    habit.members.some((m: { userId: number }) => m.userId === userId);

  if (!isMember) {
    throw new Error("You are not a member of this habit");
  }

  const updatedHabit = await db.habit.update({
    where: { id: habitId },
    data: data,
  });
  
  revalidatePath("/dashboard");
  return updatedHabit;
}

export async function inviteUserToHabit(habitId: number, userId: number, usernameOrEmail: string) {
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    include: { members: true }
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  const isMember =
    habit.creatorId === userId ||
    habit.members.some((m: { userId: number }) => m.userId === userId);

  if (!isMember) {
    throw new Error("You are not a member of this habit");
  }

  const userToInvite = await db.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    }
  });

  if (!userToInvite) {
    throw new Error("User not found");
  }

  const invitation = await db.habitMember.upsert({
    where: {
      habitId_userId: { habitId, userId: userToInvite.id }
    },
    update: {
      status: MembershipStatus.PENDING
    },
    create: {
      habitId,
      userId: userToInvite.id,
      status: MembershipStatus.PENDING
    }
  });

  revalidatePath("/dashboard");
  return invitation;
}

export async function respondToHabitInvitation(habitId: number, userId: number, status: MembershipStatus) {
  await db.habitMember.update({
    where: {
      habitId_userId: { habitId, userId }
    },
    data: {
      status: status
    }
  });

  revalidatePath("/dashboard");
}

export async function logHabit(formData: FormData, userId: number, habitId: number) {
  const notes = formData.get("notes") as string || "";
  const file = formData.get("image") as File | null;

  // Membership validation
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    include: { members: true }
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  const isMember =
    habit.creatorId === userId ||
    habit.members.some((m: { userId: number }) => m.userId === userId);

  if (!isMember) {
    throw new Error("You are not a member of this habit");
  }

  let finalProofUrl = null;
  //Date variable for filekey and habitlog
  const now = new Date();

  if (file && file.size > 0) {  // Cloud storage upload
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileKey = `users/${userId}/habits/${habitId}/${now.toISOString().replace(/[:.]/g, '-')}-${file.name.replace(/\s+/g, '-')}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read', 
      }));

      finalProofUrl = `https://${process.env.DO_SPACES_BUCKET}.tor1.digitaloceanspaces.com/${fileKey}`;
    } catch (error) {
      console.error("DigitalOcean Upload Error:", error);
    }
  }

  await db.habitLog.create({
    data: {
      userId: userId,
      habitId: habitId,
      dateCompleted: now,
      notes: notes,
      proofFileUrl: finalProofUrl,
    },
  });

  // Streak start date calc
  let currentStreakCount = 0;
  // Use now date from earlier + startDate
  let startDate = new Date(now);
  
  if (habit.frequencyPeriod === FrequencyPeriod.DAY) {
    startDate.setHours(0, 0, 0, 0);   // Set to start of day (midnight)
  } else if (habit.frequencyPeriod === FrequencyPeriod.WEEK) {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);   // Set to start of week (monday midnight)
  } else if (habit.frequencyPeriod === FrequencyPeriod.MONTH) {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);   // Set to start of month (first day midnight)
  }

  // Count num of logs from start date to now
  const logCount = await db.habitLog.count({
    where: {
      habitId: habitId,
      userId: userId,
      dateCompleted: {
        gte: startDate,
        lte: now
      }
    }
  });

  if (logCount === habit.frequencyCount) {  // Check if frequency count is met, before streak eval
    const streak = await db.streak.findUnique({
      where: { habitId_userId: { habitId, userId } }
    });

    if (!streak) {  // New streak count
      await db.streak.create({
        data: {
          habitId,
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: now
        }
      });
      currentStreakCount = 1;
    } else {  // Existing streak count
      const lastCompleted = streak.lastCompletedDate ? new Date(streak.lastCompletedDate) : null;
      let isConsecutive = false;

      if (lastCompleted) {  // Check if streak is consecutive
        const prevPeriodStart = new Date(startDate);
        if (habit.frequencyPeriod === FrequencyPeriod.DAY) {
          prevPeriodStart.setDate(prevPeriodStart.getDate() - 1);
        } 
        else if (habit.frequencyPeriod === FrequencyPeriod.WEEK) {
          prevPeriodStart.setDate(prevPeriodStart.getDate() - 7);
        } 
        else if (habit.frequencyPeriod === FrequencyPeriod.MONTH) {
          prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);
        }

        isConsecutive = lastCompleted >= prevPeriodStart;
      } 
      else {
        isConsecutive = true;
      }

      const newStreak = isConsecutive ? (streak.currentStreak + 1) : 1;
      await db.streak.update({
        where: { id: streak.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastCompletedDate: now
        }
      });
      currentStreakCount = newStreak;
    }
  } else {
    // Frequency not yet met this period, get existing streak count
    const existingStreak = await db.streak.findUnique({
      where: { habitId_userId: { habitId, userId } }
    });
    currentStreakCount = existingStreak?.currentStreak || 0;
  }

  // Create notification DB record
  const user = await db.user.findUnique({ where: { id: userId } });
  const username = user?.username || 'Someone';
  const notificationMessage = `${username} has completed the habit!\nStreak Count: ${currentStreakCount}\nNote: ${notes}`;

  const newNotification = await db.notification.create({
    data: {
      userId,
      habitId,
      message: notificationMessage,
      proofFileUrl: finalProofUrl,
    }
  });

  // Push notification via Pusher
  await pusherServer.trigger(`private-habitNotify-${habitId}`, "new-notification", {
    id: newNotification.id,
    user: username,
    action: notificationMessage.replace(username, '').trim(),
    time: "Just now",
    proofFileUrl: finalProofUrl,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}

export async function getHabitDetails(habitId: number, userId: number) {
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        }
      }
    }
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  const isMember =
    habit.creatorId === userId ||
    habit.members.some((m: { userId: number }) => m.userId === userId);

  if (!isMember) {
    throw new Error("You are not a member of this habit");
  }

  const personalStreak = await db.streak.findUnique({
    where: { habitId_userId: { habitId, userId } },
  });

  let groupStreak = null;
  if (habit.isGroup) {
    groupStreak = await db.streak.findFirst({
      where: { habitId, userId: null },
    });
  }

  const notifications = await db.notification.findMany({
    where: { habitId },
    include: {
      user: {
        select: { username: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  function formatTimeAgo(date: Date) {
    const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const formattedNotifications = notifications.map((n: any) => ({
    id: n.id,
    user: n.user.username,
    action: n.message.replace(n.user.username, '').trim(),
    time: formatTimeAgo(n.createdAt),
    proofFileUrl: n.proofFileUrl || null,
  }));

  return {
    habit: {
      id: habit.id,
      name: habit.name,
      description: habit.description || "",
      isGroup: habit.isGroup,
      frequencyCount: habit.frequencyCount,
      frequencyPeriod: habit.frequencyPeriod
    },
    members: habit.members.map((m: any) => ({
      userId: m.userId,
      username: m.user.username,
      email: m.user.email,
      status: m.status
    })),
    streakData: {
      personal: personalStreak?.currentStreak || 0,
      group: groupStreak?.currentStreak || 0
    },
    notifications: formattedNotifications
  };
}

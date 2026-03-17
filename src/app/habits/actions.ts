"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  forcePathStyle: false, 
  endpoint: `https://tor1.digitaloceanspaces.com`, 
  region: "tor1", 
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  }
});

import { FrequencyPeriod, MembershipStatus } from "@prisma/client";

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
  data: { 
    name?: string; 
    description?: string; 
    frequencyCount?: number; 
    frequencyPeriod?: FrequencyPeriod; 
    isGroup?: boolean 
  }
) {
  const updatedHabit = await db.habit.update({
    where: { id: habitId },
    data: data,
  });
  
  revalidatePath("/dashboard");
  return updatedHabit;
}

export async function inviteUserToHabit(habitId: number, usernameOrEmail: string) {
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
  
  let finalProofUrl = null;

  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const fileKey = `users/${userId}/habits/${habitId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

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
      dateCompleted: new Date(),
      notes: notes,
      proofFileUrl: finalProofUrl,
    },
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
    time: formatTimeAgo(n.createdAt)
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

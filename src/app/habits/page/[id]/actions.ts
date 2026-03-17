"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { pusherServer } from "@/lib/pusherServer";

export async function logHabitEntry(habitId: number, notes: string) {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "You must be logged in to log a habit." };
    }

    const userId = session.userId;

    const habit = await db.habit.findUnique({
      where: { id: habitId },
      include: {
        members: true
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

    await db.habitLog.create({
      data: {
        habitId,
        userId,
        dateCompleted: new Date(),
        notes,
      },
    });

    const personalStreak = await db.streak.upsert({
      where: { habitId_userId: { habitId, userId } },
      update: {
        currentStreak: { increment: 1 },
        lastCompletedDate: new Date(),
      },
      create: {
        habitId,
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: new Date(),
      },
    });
    
    if (personalStreak.currentStreak > personalStreak.longestStreak) {
      await db.streak.update({
        where: { id: personalStreak.id },
        data: { longestStreak: personalStreak.currentStreak }
      });
    }

    const user = await db.user.findUnique({ where: { id: userId }});
    const username = user?.username || 'Someone';
    const notificationMessage = `${username} has completed the habit!\nStreak Count: ${personalStreak.currentStreak}\nNote: ${notes}`;
    
    const newNotification = await db.notification.create({
      data: {
        userId,
        habitId,
        message: notificationMessage,
      }
    });

    await pusherServer.trigger(`private-habitNotify-${habitId}`, "new-notification", {
      id: newNotification.id,
      user: username,
      action: notificationMessage.replace(username, '').trim(),
      time: "Just now"
    });

    revalidatePath(`/habits/page/${habitId}`);
    
    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to log habit";
    return { success: false, error: message };
  }
}
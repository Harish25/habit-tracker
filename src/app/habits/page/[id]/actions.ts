"use server";

import { revalidatePath } from "next/cache";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../../generated/prisma/client";
import { getSession } from "@/lib/session";
import { pusherServer } from "@/lib/pusherServer";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Logs a habit completion entry for the current user.
 * Validates session, membership, and updates streaks/notifications.
 */
export async function logHabitEntry(habitId: number, notes: string) {
  try {
    // 1. Authenticate the user via the session cookie
    const session = await getSession();

    if (!session) {
      return { success: false, error: "You must be logged in to log a habit." };
    }

    const userId = session.userId;

    // 2. Fetch habit and check membership permissions
    const habit = await prisma.habit.findUnique({
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

    // Create habit log DB entry
    await prisma.habitLog.create({
      data: {
        habitId,
        userId,
        dateCompleted: new Date(),
        notes,
      },
    });

    // 4. Update or Create the user's personal streak
    const personalStreak = await prisma.streak.upsert({
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
    
    // 5. Check and update longest streak record
    if (personalStreak.currentStreak > personalStreak.longestStreak) {
      await prisma.streak.update({
        where: { id: personalStreak.id },
        data: { longestStreak: personalStreak.currentStreak }
      });
    }

    // 6. Create a notification for the feed
    const user = await prisma.user.findUnique({ where: { id: userId }});
    const username = user?.username || 'Someone';
    const notificationMessage = `${username} has completed the habit!\nStreak Count: ${personalStreak.currentStreak}\nNote: ${notes}`;
    
    const newNotification = await prisma.notification.create({
      data: {
        userId,
        habitId,
        message: notificationMessage,
      }
    });

    // Broadcast notification to Pusher channel
    await pusherServer.trigger(`private-habitNotify-${habitId}`, "new-notification", {
      id: newNotification.id,
      user: username,
      action: notificationMessage.replace(username, '').trim(),
      time: "Just now"
    });

    // Ensure new data shown
    revalidatePath(`/habits/page/${habitId}`);
    
    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to log habit";
    return { success: false, error: message };
  }
}
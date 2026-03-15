"use server";

import { revalidatePath } from "next/cache";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function logHabitEntry(habitId: number, notes: string) {
  try {
    // Placeholder id, need to update with UserID from session
    const userId = 1;

    // Check if habit exists and if user is member
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        members: true
      }
    });

    if (!habit) {
      throw new Error("Habit not found");
    }

    const isMember = habit.creatorId === userId || habit.members.some((m: { userId: number }) => m.userId === userId);
    
    if (!isMember) {
      throw new Error("You are not a member of this habit");
    }

    // Create habit log entry
    await prisma.habitLog.create({
      data: {
        habitId,
        userId,
        dateCompleted: new Date(),
        notes,
      },
    });

    // Increment personal streak
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
    
    // Update longest streak
    if (personalStreak.currentStreak > personalStreak.longestStreak) {
      await prisma.streak.update({
        where: { id: personalStreak.id },
        data: { longestStreak: personalStreak.currentStreak }
      });
    }

    // Add notification for notification feed
    const user = await prisma.user.findUnique({ where: { id: userId }});
    await prisma.notification.create({
      data: {
        userId,
        habitId,
        message: `${user?.username || 'Someone'} completed the habit!`,
      }
    });

    // Update page to show new data
    revalidatePath(`/habits/page/${habitId}`);
    
    return { success: true };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
       return { success: false, error: "You have already logged this habit today." };
    }
    const message = error instanceof Error ? error.message : "Failed to log habit";
    return { success: false, error: message };
  }
}

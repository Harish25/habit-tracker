"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createHabit(
  userId: number, 
  name: string, 
  description?: string // Added '?' to make it optional
) {
  return await db.habit.create({
    data: {
      creatorId: userId,
      name: name,
      description: description || "", // Fallback to empty string if undefined
    },
  });
  
  revalidatePath("/dashboard");
}

export async function logHabit(userId: number, habitId: number, notes: string = "") {
  await db.habitLog.create({
    data: {
      userId: userId,
      habitId: habitId,
      dateCompleted: new Date(),
      notes: notes
    },
  });

  revalidatePath("/dashboard");
}




import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { habitId, userId } = await req.json();

    if (!habitId || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await db.habitParticipant.deleteMany({
      where: {
        habitId: Number(habitId),
        userId: Number(userId),
      },
    });

    const remainingParticipants = await db.habitParticipant.count({
      where: { habitId: Number(habitId) },
    });

    //delete habit if no members
    if (remainingParticipants === 0) {
      await db.habitLog.deleteMany({ where: { habitId: Number(habitId) } });
      await db.habit.delete({
        where: { id: Number(habitId) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LEAVE_HABIT_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
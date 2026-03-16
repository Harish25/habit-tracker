import { pusherServer } from "@/lib/pusherServer";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  const data = await req.text();
  const formData = new URLSearchParams(data);
  const socketId = formData.get("socket_id");
  const channelName = formData.get("channel_name");

  if (!socketId || !channelName) {
    return new Response("Missing socket_id or channel_name", { status: 400 });
  }

  // Channel format: private-habitNotify-{habitId}
  const match = channelName.match(/^private-habitNotify-(\d+)$/);
  if (!match) {
    return new Response("Invalid channel name", { status: 403 });
  }

  const habitId = parseInt(match[1], 10);
  const userId = 1; // Hardcoded userID, update from session later

  try {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { members: true },
    });

    if (!habit) {
       return new Response("Habit not found", { status: 404 });
    }

    const isMember = (habit.creatorId === userId) || habit.members.some((m: { userId: number }) => m.userId === userId);
    
    if (!isMember) {  // User not auth, can't access channel
      return new Response("Unauthorized", { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return new Response(JSON.stringify(authResponse), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

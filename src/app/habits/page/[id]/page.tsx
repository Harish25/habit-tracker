import { notFound } from "next/navigation";
import HabitTracker from "@/components/habits/HabitTracker";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function HabitDynamicPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const habitId = parseInt(resolvedParams.id, 10);

  if (isNaN(habitId)) {
    notFound();
  }

  // Fetch habit details
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit) {
    notFound();
  }

  // Placeholder userId: 1
  // need to update to use actual user ID from session
  const currentUserId = 1;

  // Fetch individual streak
  const personalStreak = await prisma.streak.findUnique({
    where: { habitId_userId: { habitId, userId: currentUserId } },
  });

  // Fetch group streak (where userId is null)
  let groupStreak = null;
  if (habit.isGroup) {
    groupStreak = await prisma.streak.findFirst({
      where: { habitId, userId: null },
    });
  }

  // Placeholder: fetch recent notifications, need to update with Pusher
  const notifications = await prisma.notification.findMany({
    where: { habitId },
    include: {
      user: {
        select: { username: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Format notifications for component
  const formattedNotifications = notifications.map(n => ({
    id: n.id,
    user: n.user.username,
    action: n.message.replace(n.user.username, '').trim(),
    time: formatTimeAgo(n.createdAt)
  }));

  function formatTimeAgo(date: Date) {
    const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <HabitTracker 
           habit={{
             id: habit.id,
             name: habit.name,
             description: habit.description || "",
             isGroup: habit.isGroup
           }}
           streakData={{
             personal: personalStreak?.currentStreak || 0,
             group: groupStreak?.currentStreak || 0
           }}
           notifications={formattedNotifications}
        />
      </div>
    </main>
  );
}

import { notFound, redirect } from "next/navigation"; 
import HabitTracker from "@/components/habits/HabitTracker";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function HabitDynamicPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Resolve Params for the dynamic ID
  const resolvedParams = await params;
  const habitId = parseInt(resolvedParams.id, 10);

  if (isNaN(habitId)) {
    notFound();
  }

  // 2. Authentication Logic
  const session = await getSession();
  
  // If no session, redirect to login
  if (!session) {
    redirect('/users/login');
  }

  const currentUserId = session.userId;

  // 3. Fetch Habit Details
  const habit = await db.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit) {
    notFound();
  }

  // 4. Fetch Personal and Group Streaks
  const personalStreak = await db.streak.findUnique({
    where: { habitId_userId: { habitId, userId: currentUserId } },
  });

  let groupStreak = null;
  if (habit.isGroup) {
    groupStreak = await db.streak.findFirst({
      where: { habitId, userId: null },
    });
  }

  // 5. Fetch Recent Notifications
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

  // Helper function for time formatting
  function formatTimeAgo(date: Date) {
    const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const formattedNotifications = notifications.map(n => ({
    id: n.id,
    user: n.user.username,
    action: n.message.replace(n.user.username, '').trim(),
    time: formatTimeAgo(n.createdAt)
  }));

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
           userId={currentUserId} 
        />
      </div>
    </main>
  );
}
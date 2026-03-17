import db from "@/lib/db";
import DashboardClient from "./DashboardClient";
import { MembershipStatus } from "@prisma/client";

export default async function DashboardPage() {
  // Placeholder userId: 1 (should be replaced with actual auth session later)
  const currentUserId = 1;

  const habits = await db.habit.findMany({
    where: {
      members: {
        some: {
          userId: currentUserId,
          status: MembershipStatus.ACCEPTED
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingInvitations = await db.habitMember.findMany({
    where: {
      userId: currentUserId,
      status: MembershipStatus.PENDING
    },
    include: {
      habit: true
    }
  });

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back! Here's your habit progress.</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 w-full md:w-auto">
            + New Habit
          </button>
        </header>

        <DashboardClient 
          userId={currentUserId}
          habits={habits}
          pendingInvitations={pendingInvitations}
          pusherKey={process.env.PUSHER_KEY || ""}
          pusherCluster={process.env.PUSHER_CLUSTER || ""}
        />
      </div>
    </main>
  );
}
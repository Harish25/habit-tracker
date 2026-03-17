import db from "@/lib/db";
import DashboardClient from "./DashboardClient";
import { MembershipStatus } from "@prisma/client";
import AddHabitButton from "@/components/AddHabitButton";

import { getCurrentUser } from "@/app/users/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/users/login");
  }

  const currentUserId = user.id;

  const habits = await db.habit.findMany({
    where: {
      OR: [
        { creatorId: currentUserId },
        { 
          members: {
            some: {
              userId: currentUserId,
              status: MembershipStatus.ACCEPTED
            }
          }
        }
      ]
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
            <AddHabitButton userId={currentUserId} />
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
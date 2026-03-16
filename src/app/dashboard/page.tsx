import db from "@/lib/db";
import HabitCard from "@/components/HabitCard";
import FriendsList from "@/components/FriendsList";
import PendingRequests from "@/components/PendingRequests";
import AddHabitButton from "@/components/AddHabitButton"; 
import LogoutButton from "@/components/logoutButton"; 
import { getSession } from "@/lib/session"; 
import { redirect } from "next/navigation"; 

export const dynamic = 'force-dynamic';

export default async function Dashboard() {

  const session = await getSession();

  if (!session) {
    redirect('/users/login');
  }

  const currentUserId = session.userId;

  const habitMembers = await db.habitMember.findMany({
    where: { userId: currentUserId }
  });

  const habitIds = habitMembers.map((hm) => hm.habitId);

  const habits = await db.habit.findMany({
    where: { id: { in: habitIds } }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900">My Daily Habits</h1>
            
            {/* Grouping Logout and Add Habit buttons together */}
            <div className="flex items-center gap-3">
              <LogoutButton />
              <AddHabitButton userId={currentUserId} />
            </div>
          </header>

          <PendingRequests userId={currentUserId} />

          <div className="grid grid-cols-1 gap-4">
            {habits.length === 0 ? (
              <div className="p-12 border-2 border-dashed rounded-2xl text-center text-gray-400">
                No habits yet. Click the button above to start your journey!
              </div>
            ) : (
              habits.map(h => (
                <HabitCard key={h.id} habit={h} userId={currentUserId} />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <FriendsList userId={currentUserId} />
        </div>

      </div>
    </div>
  );
}
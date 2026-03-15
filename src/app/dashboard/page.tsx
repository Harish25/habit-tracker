import db from "@/lib/db";
import HabitCard from "@/components/HabitCard";
import FriendsList from "@/components/FriendsList";
import PendingRequests from "@/components/PendingRequests";
import AddHabitButton from "@/components/AddHabitButton"; // [1] Import the new interactive button

export default async function Dashboard() {
  const currentUserId = 6; 

  // Fetch habits from the database
  const habits = await db.habit.findMany({
    where: { creatorId: currentUserId } // [2] Using underscore to match your DB schema
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900">My Daily Habits</h1>
            
            {/* [3] Swapped static button for the Client Component button */}
            <AddHabitButton userId={currentUserId} />
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

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <FriendsList userId={currentUserId} />
        </div>

      </div>
    </div>
  );
}
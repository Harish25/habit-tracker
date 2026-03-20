"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HabitCard from "@/components/HabitCard";
import PendingRequests from "@/components/PendingRequests";
import HabitTracker from "@/components/habits/HabitTracker";
import AddHabitButton from "@/components/AddHabitButton";
import LogoutButton from "@/components/logoutButton";
import { getHabitDetails } from "@/app/habits/actions";

interface Habit {
  id: number;
  name: string;
  description: string | null;
  isGroup: boolean;
  frequencyCount: number;
  frequencyPeriod: any;
}

interface DashboardClientProps {
  userId: number;
  habits: Habit[];
  pendingInvitations: any[];
  pusherKey: string;
  pusherCluster: string;
}

export default function DashboardClient({ 
  userId, 
  habits: initialHabits, 
  pendingInvitations, 
  pusherKey, 
  pusherCluster 
}: DashboardClientProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [habitDetails, setHabitDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  const refreshDetails = () => {
    if (selectedHabitId) {
      setIsLoading(true);
      getHabitDetails(selectedHabitId, userId)
        .then((data) => {
          setHabitDetails(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch habit details:", err);
          setIsLoading(false);
        });
    }
  };

  const handleDelete = (id: number) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setSelectedHabitId(null);
    setHabitDetails(null);
    router.refresh();
  };

  useEffect(() => {
    refreshDetails();
  }, [selectedHabitId, userId]);

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back! Here's your habit progress.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <AddHabitButton userId={userId} />
            <LogoutButton />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* habit list */}
          <div className="lg:col-span-5 space-y-6">
            <PendingRequests userId={userId} invitations={pendingInvitations} />

            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Habits</h2>
              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You don't have any habits yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isSelected={selectedHabitId === habit.id}
                      onClick={() => setSelectedHabitId(habit.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* habit info */}
          <div className="lg:col-span-7">
            {selectedHabitId && isLoading ? (
              <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow-sm border">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : selectedHabitId && habitDetails ? (
              <HabitTracker
                key={habitDetails.habit.id}
                habit={habitDetails.habit}
                members={habitDetails.members}
                streakData={habitDetails.streakData}
                notifications={habitDetails.notifications}
                pusherKey={pusherKey}
                pusherCluster={pusherCluster}
                userId={userId}
                onRefresh={refreshDetails}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <div className="text-4xl mb-4 opacity-50"></div>
                <p className="text-lg">Select a habit to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
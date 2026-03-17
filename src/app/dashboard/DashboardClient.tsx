"use client";

import { useState, useEffect } from "react";
import HabitCard from "@/components/HabitCard";
import PendingRequests from "@/components/PendingRequests";
import HabitTracker from "@/components/habits/HabitTracker";
import { getHabitDetails } from "@/app/habits/actions";

interface DashboardClientProps {
  userId: number;
  habits: any[];
  pendingInvitations: any[];
  pusherKey: string;
  pusherCluster: string;
}

export default function DashboardClient({ userId, habits, pendingInvitations, pusherKey, pusherCluster }: DashboardClientProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [habitDetails, setHabitDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    refreshDetails();
  }, [selectedHabitId, userId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <PendingRequests userId={userId} invitations={pendingInvitations} />

        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Habits</h2>
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any habits yet.</p>
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

      <div className="lg:col-span-7">
        {selectedHabitId && isLoading ? (
          <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow-sm border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : selectedHabitId && habitDetails ? (
          <HabitTracker
            habit={habitDetails.habit}
            members={habitDetails.members}
            streakData={habitDetails.streakData}
            notifications={habitDetails.notifications}
            pusherKey={pusherKey}
            pusherCluster={pusherCluster}
            userId={userId}
            onRefresh={refreshDetails}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-lg">Select a habit to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

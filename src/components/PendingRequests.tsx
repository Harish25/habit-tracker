"use client";

import { useTransition } from "react";
import { respondToHabitInvitation } from "@/app/habits/actions";
import { MembershipStatus } from "@prisma/client";

interface PendingRequestsProps {
  userId: number;
  invitations: any[];
}

export default function PendingRequests({ userId, invitations }: PendingRequestsProps) {
  const [isPending, startTransition] = useTransition();

  if (!invitations || invitations.length === 0) return null;

  const handleResponse = (habitId: number, status: MembershipStatus) => {
    startTransition(async () => {
      await respondToHabitInvitation(habitId, userId, status);
    });
  };

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 shadow-sm">
      <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
        Habit Invitations
      </h3>
      <div className="space-y-3">
        {invitations.map((inv) => (
          <div key={inv.habitId} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg border border-indigo-50 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Invitation to join <span className="text-indigo-600">"{inv.habit.name}"</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {inv.habit.description || "No description provided."}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => handleResponse(inv.habitId, MembershipStatus.ACCEPTED)}
                disabled={isPending}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Accept
              </button>
              <button 
                onClick={() => handleResponse(inv.habitId, MembershipStatus.REJECTED)}
                disabled={isPending}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
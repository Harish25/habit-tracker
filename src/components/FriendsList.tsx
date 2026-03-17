"use client";

import { useState, useTransition } from "react";
import { Users, UserPlus, X } from "lucide-react";
import { inviteUserToHabit } from "@/app/habits/actions";

interface FriendsListProps {
  userId: number;
}

export default function FriendsList({ userId }: FriendsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [habitId, setHabitId] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInvite = () => {
    if (!email.trim() || !habitId.trim()) {
      setMessage({ text: "Please enter both a habit ID and an email address.", isError: true });
      return;
    }
    startTransition(async () => {
      try {
        await inviteUserToHabit(parseInt(habitId, 10), email);
        setMessage({ text: "Invitation sent!", isError: false });
        setEmail("");
        setHabitId("");
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ text: err.message || "Failed to send invitation.", isError: true });
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
      >
        <Users className="w-4 h-4" />
        Invite
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Invite to Habit
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="number"
              placeholder="Habit ID"
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="email"
              placeholder="Friend's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />

            {message && (
              <p className={`text-xs ${message.isError ? "text-red-500" : "text-green-600"}`}>
                {message.text}
              </p>
            )}

            <button
              onClick={handleInvite}
              disabled={isPending}
              className="w-full bg-indigo-600 text-white py-2 text-sm font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

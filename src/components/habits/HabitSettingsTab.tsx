"use client";

import { useActionState, useState } from "react";
import { updateHabit, inviteUserToHabit, leaveHabit } from "@/app/habits/actions";
import { FrequencyPeriod } from "@prisma/client";
import { useRouter } from "next/navigation";

interface HabitSettingsTabProps {
  habit: { 
    id: number; 
    name: string; 
    description: string; 
    isGroup: boolean; 
    frequencyCount: number; 
    frequencyPeriod: FrequencyPeriod 
  };
  members: { userId: number; username: string; email: string; status: string }[];
  userId: number;
  onRefresh?: () => void;
  onDelete?: (id: number) => void;
}

export default function HabitSettingsTab({ habit, members, userId, onRefresh, onDelete }: HabitSettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();
  
  const [updateState, updateAction, isUpdating] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const frequencyCount = parseInt(formData.get("frequencyCount") as string, 10);
      const frequencyPeriod = formData.get("frequencyPeriod") as FrequencyPeriod;

      await updateHabit(habit.id, userId, { 
        name, 
        description, 
        frequencyCount, 
        frequencyPeriod 
      });
      
      setIsEditing(false);
      if (onRefresh) onRefresh();
      return { message: "Updated!", error: false };
    } catch (e: any) {
      return { message: e.message, error: true };
    }
  }, { message: "", error: false });

  const [inviteState, inviteAction, isInviting] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const usernameOrEmail = formData.get("user") as string;
      await inviteUserToHabit(habit.id, userId, usernameOrEmail);
      if (onRefresh) onRefresh();
      return { message: "Invitation sent!", error: false };
    } catch (e: any) {
      return { message: e.message, error: true };
    }
  }, { message: "", error: false });

  const handleLeaveHabit = async () => {
    if (!confirm("Are you sure you want to leave this habit?")) return;
    
    setIsLeaving(true);
    try {
      await leaveHabit(habit.id, userId);
      
      if (onDelete) {
        onDelete(habit.id);
      }
    } catch (err) {
      alert("Failed to leave habit. Please try again.");
      console.error(err);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Habit Details</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-indigo-600 text-sm font-semibold hover:underline"
          >
            {isEditing ? "Cancel" : "Edit Habit"}
          </button>
        </div>

        {isEditing ? (
          <form action={updateAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  name="name" 
                  defaultValue={habit.name}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Frequency</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    name="frequencyCount"
                    defaultValue={habit.frequencyCount}
                    min={1}
                    className="w-16 px-2 py-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <span className="text-sm text-gray-500">time(s) every</span>
                  <select 
                    name="frequencyPeriod" 
                    defaultValue={habit.frequencyPeriod}
                    className="flex-1 px-2 py-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="DAY">Day</option>
                    <option value="WEEK">Week</option>
                    <option value="MONTH">Month</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                defaultValue={habit.description}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={isUpdating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
            {updateState.message && <p className={`text-sm ${updateState.error ? "text-red-500" : "text-green-500"}`}>{updateState.message}</p>}
          </form>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Goal</p>
                <p className="text-gray-900 font-bold text-lg">
                  {habit.frequencyCount}x <span className="text-gray-500 font-normal text-sm">every</span> {habit.frequencyPeriod.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Type</p>
                <p className="text-gray-900 font-medium">
                  {habit.isGroup ? "👥 Group" : "👤 Personal"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Description</p>
              <p className="text-gray-600 italic mt-1">{habit.description || "No description provided."}</p>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Participants</h2>
        
        <div className="space-y-4 mb-8">
          {members.map(member => (
            <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {member.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{member.username}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                member.status === "ACCEPTED" ? "bg-green-100 text-green-700 border border-green-200" :
                member.status === "PENDING" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                "bg-red-100 text-red-700 border border-red-200"
              }`}>
                {member.status}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Invite Someone</h3>
          <form action={inviteAction} className="flex gap-2">
            <input 
              name="user"
              placeholder="Username or Email"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              required
              disabled={isInviting}
            />
            <button 
              type="submit"
              disabled={isInviting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isInviting ? "Inviting..." : "Send Invite"}
            </button>
          </form>
          {inviteState.message && <p className={`text-sm mt-2 ${inviteState.error ? "text-red-500" : "text-green-500"}`}>{inviteState.message}</p>}
        </div>
      </section>

      <section className="pt-4">
        <button
          onClick={handleLeaveHabit}
          disabled={isLeaving}
          className="w-full p-4 border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
        >
          {isLeaving ? "Leaving..." : "Leave Habit"}
        </button>
      </section>
    </div>
  );
}
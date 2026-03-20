"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { Activity, ChevronRight } from "lucide-react";
import HabitOverviewTab from "./HabitOverviewTab";
import HabitUpdatesTab from "./HabitUpdatesTab";
import HabitLoggingTab from "./HabitLoggingTab";
import HabitSettingsTab from "./HabitSettingsTab";

import { FrequencyPeriod } from "@prisma/client";

type Tab = "overview" | "updates" | "logging" | "settings";

interface HabitTrackerProps {
  habit: { 
    id: number; 
    name: string; 
    description: string; 
    isGroup: boolean; 
    frequencyCount: number; 
    frequencyPeriod: FrequencyPeriod 
  };
  members: { userId: number; username: string; email: string; status: string }[];
  streakData: { personal: number; group: number };
  notifications: { id: number; user: string; action: string; time: string; proofFileUrl?: string | null }[];
  pusherKey: string;
  pusherCluster: string;
  userId: number;
  onRefresh?: () => void;
  onDelete?: (id: number) => void;
}

export default function HabitTracker({ 
  habit, 
  members, 
  streakData, 
  notifications: initialNotifications, 
  pusherKey, 
  pusherCluster, 
  userId,
  onRefresh,
  onDelete
}: HabitTrackerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [liveNotifications, setLiveNotifications] = useState(initialNotifications);

  useEffect(() => {
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const channelName = `private-habitNotify-${habit.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-notification", (data: { id: number; user: string; action: string; time: string; proofFileUrl?: string | null }) => {
      setLiveNotifications(prev => {
        if (prev.some(n => n.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [habit.id, pusherKey, pusherCluster]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{habit.name}</h2>
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <span>{habit.frequencyCount} time(s) per {habit.frequencyPeriod.toLowerCase()}</span>
              {habit.isGroup && (
                <span className="flex items-center gap-1 text-gray-400 font-normal">
                  <ChevronRight className="w-4 h-4" /> 👥 Group Habit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b mt-6">
        {(["overview", "updates", "logging", "settings"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold capitalize transition-all relative ${
              activeTab === tab ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[400px]">
        {activeTab === "overview" && (
          <HabitOverviewTab 
            habitDescription={habit.description} 
            personalStreak={streakData.personal} 
            groupStreak={streakData.group} 
            isGroup={habit.isGroup} 
          />
        )}
        {activeTab === "updates" && (
          <HabitUpdatesTab notifications={liveNotifications} />
        )}
        {activeTab === "logging" && (
          <HabitLoggingTab habitId={habit.id} userId={userId} />
        )}
        {activeTab === "settings" && (
          <HabitSettingsTab 
            habit={habit} 
            members={members} 
            userId={userId} 
            onRefresh={onRefresh}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
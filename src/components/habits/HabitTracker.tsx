"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import HabitOverviewTab from "./HabitOverviewTab";
import HabitUpdatesTab from "./HabitUpdatesTab";
import HabitLoggingTab from "./HabitLoggingTab";
import HabitSettingsTab from "./HabitSettingsTab";

type Tab = "overview" | "updates" | "logging" | "settings";

interface HabitTrackerProps {
  habit: { id: number; name: string; description: string; isGroup: boolean };
  streakData: { personal: number; group: number };
  notifications: { id: number; user: string; action: string; time: string }[];
  pusherKey: string;
  pusherCluster: string;
  userId: number;
}

export default function HabitTracker({ habit, streakData, notifications: initialNotifications, pusherKey, pusherCluster, userId }: HabitTrackerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [liveNotifications, setLiveNotifications] = useState(initialNotifications);

  // Subscribe to channel in parent component to listen to updates across tabs
  useEffect(() => {
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const channelName = `private-habitNotify-${habit.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-notification", (data: { id: number; user: string; action: string; time: string }) => {
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <HabitOverviewTab 
          habitDescription={habit.description} 
          personalStreak={streakData.personal} 
          groupStreak={streakData.group} 
          isGroup={habit.isGroup} 
        />;
      case "updates":
        return <HabitUpdatesTab 
          notifications={liveNotifications}
        />;
      case "logging":
        return <HabitLoggingTab habitId={habit.id} userId={userId} />;
      case "settings":
        return <HabitSettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">{habit.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Daily {habit.isGroup ? "• Group Habit" : "• Individual Habit"}</p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <nav className="flex overflow-x-auto">
          {(["overview", "updates", "logging", "settings"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none ${
                activeTab === tab
                  ? "border-b-2 border-black text-black bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="p-6 bg-white min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
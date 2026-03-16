"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";

interface Notification {
  id: number;
  user: string;
  action: string;
  time: string;
}

interface HabitUpdatesTabProps {
  habitId: number;
  initialNotifications: Notification[];
  pusherKey: string;
  pusherCluster: string;
}

export default function HabitUpdatesTab({ 
  habitId, 
  initialNotifications, 
  pusherKey, 
  pusherCluster 
}: HabitUpdatesTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const channelName = `private-habitNotify-${habitId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-notification", (data: Notification) => {
      setNotifications(prev => {
        // Prevent duplicate notifications
        if (prev.some(n => n.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [habitId, pusherKey, pusherCluster]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Stream</h3>
      
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="bg-white p-2 text-gray-400 rounded-full shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  <span className="font-semibold">{notification.user}</span> {notification.action}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">No recent updates.</p>
        </div>
      )}
    </div>
  );
}

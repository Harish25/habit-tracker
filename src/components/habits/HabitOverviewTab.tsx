import { Flame, Users } from "lucide-react";

interface HabitOverviewTabProps {
  habitDescription: string;
  personalStreak: number;
  groupStreak: number;
  isGroup: boolean;
}

export default function HabitOverviewTab({ habitDescription, personalStreak, groupStreak, isGroup }: HabitOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Streak Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center space-x-4">
          <div className="bg-orange-50 p-3 rounded-full">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Your Current Streak</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{personalStreak}</span>
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>
        </div>

        {/* Group Streak Card */}
        {isGroup && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Group Streak</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">{groupStreak}</span>
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">About this habit</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {habitDescription || "No description provided for this habit."}
        </p>
      </div>
    </div>
  );
}

interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    description: string | null;
    isGroup: boolean;
    frequencyCount: number;
    frequencyPeriod: any; // Using any to avoid enum type issues in props for now
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export default function HabitCard({ habit, isSelected, onClick }: HabitCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border rounded-xl shadow-sm transition-all cursor-pointer group hover:shadow-md ${
        isSelected 
        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" 
        : "border-gray-200 bg-white hover:border-indigo-300"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold transition-colors ${isSelected ? "text-indigo-900" : "text-gray-900 group-hover:text-indigo-600"}`}>
          {habit.name}
        </h3>
        {habit.isGroup && (
          <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
            Group
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
          {habit.frequencyCount}x {habit.frequencyPeriod.toLowerCase()}
        </p>
        <div className="flex -space-x-1">
          {/* Members could go here */}
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem] mb-3">{habit.description || "No description provided."}</p>
    </div>
  );
}
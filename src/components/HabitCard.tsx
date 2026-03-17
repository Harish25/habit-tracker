interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    description: string | null;
    isGroup: boolean;
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
      <p className="text-gray-500 text-sm line-clamp-1">{habit.description || "No description"}</p>
    </div>
  );
}
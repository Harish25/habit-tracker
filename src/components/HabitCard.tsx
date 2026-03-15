import { logHabit } from "@/app/habits/actions";

export default function HabitCard({ habit, userId }: { habit: any, userId: number }) {
  const handleLog = logHabit.bind(null, userId, habit.id, "Completed via Dashboard");
    
  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
      <div>
        <h3 className="font-bold text-lg text-gray-800">{habit.name}</h3>
        <p className="text-sm text-gray-500">{habit.description}</p>
      </div>
      <form action={handleLog}>
        <button className="h-10 w-10 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center transition font-bold">
          ✓
        </button>
      </form>
    </div>
  );
}
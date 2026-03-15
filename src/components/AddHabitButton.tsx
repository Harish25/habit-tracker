"use client";

import { useState } from "react";
import AddHabitForm from "./AddHabitForm";

export default function AddHabitButton({ userId }: { userId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        + New Habit
      </button>

      {isOpen && <AddHabitForm userId={userId} onClose={() => setIsOpen(false)} />}
    </>
  );
}
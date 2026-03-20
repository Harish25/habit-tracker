"use client";

import { useState } from "react";
import AddHabitForm from "./AddHabitForm";
import { Button } from "@/components/ui/button";

export default function AddHabitButton({ userId }: { userId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 hover:text-white transition"
      >
        + New Habit
      </Button>

      {isOpen && <AddHabitForm userId={userId} onClose={() => setIsOpen(false)} />}
    </>
  );
}
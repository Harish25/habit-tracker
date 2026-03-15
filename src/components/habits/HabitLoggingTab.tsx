"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { logHabitEntry } from "@/app/habits/page/[id]/actions";

interface HabitLoggingTabProps {
  habitId: number;
}

export default function HabitLoggingTab({ habitId }: HabitLoggingTabProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Notes are mandatory to log this habit.");
      return;
    }
    
    setError("");
    
    try {
      const result = await logHabitEntry(habitId, notes);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setIsSubmitted(true);
      // Reset after success msg
      setTimeout(() => {
        setIsSubmitted(false);
        setNotes("");
      }, 2000);
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-xl">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Log Today&apos;s Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Add some details about your habit today.</p>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error && e.target.value.trim()) setError("");
            }}
            className={`w-full rounded-md border text-sm p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
            }`}
            placeholder="E.g., Ran 5km around the park. Felt great!"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitted}
          className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
            isSubmitted ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-800"
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Logged successfully
            </>
          ) : (
            "Log Habit"
          )}
        </button>
      </form>
    </div>
  );
}

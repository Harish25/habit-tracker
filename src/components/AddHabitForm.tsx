"use client";

import { useActionState } from "react"; // 1. Updated import from 'react'
import { createHabit } from "@/app/habits/actions"; 

export default function AddHabitForm({ userId, onClose }: { userId: number, onClose: () => void }) {
  // 2. Swapped to useActionState and added 'isPending'
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
<<<<<<< HEAD

      // Passing userId from props as before
      await createHabit(userId, title, description);
=======
      const frequencyCount = parseInt(formData.get("frequencyCount") as string, 10);
      const frequencyPeriod = formData.get("frequencyPeriod") as any;

      await createHabit(userId, title, description, false, frequencyCount, frequencyPeriod);
>>>>>>> 4e86535 (Restore habit features and authentication)
      
      onClose(); 
      return { message: "Success!", error: false };
    } catch (e: any) {
      return { message: e.message, error: true };
    }
  }, { message: "", error: false });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Habit</h2>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
            <input
              name="title"
              placeholder="e.g. Morning Run"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
              required
              autoFocus
              disabled={isPending} // Disable input while submitting
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="What is your goal?"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none disabled:bg-gray-100"
              rows={3}
              disabled={isPending} // Disable textarea while submitting
            />
          </div>
<<<<<<< HEAD
          
          {/* Show error message if it exists */}
          {state.error && <p className="text-red-500 text-sm">{state.message}</p>}

=======

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Frequency Goal</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                name="frequencyCount"
                defaultValue={1}
                min={1}
                className="w-20 px-3 py-2 border-2 border-white bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold"
                required
              />
              <span className="text-sm text-gray-400 font-medium">time(s) every</span>
              <select 
                name="frequencyPeriod" 
                defaultValue="DAY"
                className="flex-1 px-3 py-2 border-2 border-white bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none"
              >
                <option value="DAY">Day</option>
                <option value="WEEK">Week</option>
                <option value="MONTH">Month</option>
              </select>
            </div>
          </div>
>>>>>>> 4e86535 (Restore habit features and authentication)
          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isPending}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
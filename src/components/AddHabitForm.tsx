"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createHabit } from "@/app/habits/actions"; // Assuming your action name

export default function AddHabitForm({ userId, onClose }: { userId: number, onClose: () => void }) {
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    try {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      
      // Call your action with the optional description
      await createHabit(userId, title, description);
      
      onClose(); // Close modal on success
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="What is your goal?"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
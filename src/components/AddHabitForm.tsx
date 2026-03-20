"use client";

import { useActionState } from "react";
import { createHabit } from "@/app/habits/actions"; 

export default function AddHabitForm({ userId, onClose }: { userId: number, onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const frequencyCount = parseInt(formData.get("frequencyCount") as string, 10);
      const frequencyPeriod = formData.get("frequencyPeriod") as any;

      await createHabit(userId, title, description, false, frequencyCount, frequencyPeriod);
      
      onClose(); 
      return { message: "Success!", error: false };
    } catch (e: any) {
      return { message: e.message, error: true };
    }
  }, { message: "", error: false });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Habit</h2>
          <p className="text-slate-500 text-sm">Define your goal to get started.</p>
        </div>
        
        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Habit Name</label>
            <input
              name="title"
              placeholder="e.g. Morning Run"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-50"
              required
              autoFocus
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
            <textarea
              name="description"
              placeholder="What is your goal?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition disabled:opacity-50"
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Frequency Goal</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                name="frequencyCount"
                defaultValue={1}
                min={1}
                className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-slate-700"
                required
              />
              <span className="text-sm text-slate-400 font-semibold italic">time(s) every</span>
              <select 
                name="frequencyPeriod" 
                defaultValue="DAY"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="DAY">Day</option>
                <option value="WEEK">Week</option>
                <option value="MONTH">Month</option>
              </select>
            </div>
          </div>

          {state.error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-500 text-xs font-bold text-center">{state.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isPending}
              className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition disabled:bg-indigo-400 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Start Habit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
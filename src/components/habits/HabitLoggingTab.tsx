"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { logHabit } from "@/app/habits/actions";
import UploadButton from "@/components/uploadButton";

interface HabitLoggingTabProps {
  habitId: number;
  userId: number;
}

export default function HabitLoggingTab({ habitId, userId }: HabitLoggingTabProps) {
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      setError("Notes are mandatory to log this habit.");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("notes", notes);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      await logHabit(formData, userId, habitId);
      
      setIsSubmitted(true);
      setNotes("");
      setSelectedFile(null);
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error && e.target.value.trim()) setError("");
            }}
            className={`w-full rounded-md border text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            placeholder="E.g., Ran 5km around the park. Felt great!"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Proof of Progress (Optional)</label>
          <UploadButton onFileSelect={setSelectedFile} />
        </div>

        <button
          type="submit"
          disabled={isSubmitted || isSubmitting}
          className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitted ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging...
            </>
          ) : isSubmitted ? (
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
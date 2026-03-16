"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { logHabitEntry } from "@/app/habits/page/[id]/actions";
import UploadButton from "@/components/uploadButton";

interface HabitLoggingTabProps {
  habitId: number;
  userId?: number; // temp -not used by logHabitEntry
}

export default function HabitLoggingTab({ habitId, userId }: HabitLoggingTabProps) {
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      setError("Notes are mandatory to log this habit.");
      return;
    }
    
    setError("");
    setIsPending(true);
    
    // Create FormData to bundle note with file
    const formData = new FormData();
    formData.append("notes", notes);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      // logHabitEntry saves the log, creates notification, and triggers Pusher
      const result = await logHabitEntry(habitId, notes);
      if (!result.success) {
        setError(result.error || "Failed to log habit.");
        setIsPending(false);
        return;
      }
      
      setIsSubmitted(true);
      setIsPending(false);
      
      // Reset after success
      setTimeout(() => {
        setIsSubmitted(false);
        setNotes("");
        setSelectedFile(null);
      }, 2000);
    } catch (err) {
      setIsPending(false);
      setError("Failed to upload image or save log. Please try again.");
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
            disabled={isPending}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error && e.target.value.trim()) setError("");
            }}
            className={`w-full rounded-md border text-sm p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
              error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
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
          disabled={isPending || isSubmitted}
          className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
            isSubmitted 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-black hover:bg-gray-800 disabled:bg-gray-400"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading to Space...
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
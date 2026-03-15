"use client";

import { useFormState } from "react-dom";
import { sendFriendRequest } from "@/app/friends/actions";

export default function AddFriendForm({ currentUserId }: { currentUserId: number }) {
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      await sendFriendRequest(currentUserId, email);
      return { message: "Request sent successfully!", error: false };
    } catch (e: any) {
      return { message: e.message, error: true };
    }
  }, { message: "", error: false });

  return (
    <section className="bg-white p-6 rounded-2xl border shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Find a Partner</h2>
      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input 
            name="email"
            type="email" 
            placeholder="friend@example.com"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
            Send Request
          </button>
        </div>
        {state.message && (
          <div className={`text-sm font-bold p-3 rounded-lg ${
            state.error ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
          }`}>
            {state.error ? "⚠️ " : "✅ "} {state.message}
          </div>
        )}
      </form>
    </section>
  );
}
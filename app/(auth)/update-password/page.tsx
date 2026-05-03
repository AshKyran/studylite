// app/update-password/page.tsx
"use client";

import { useState } from "react";
import { updatePassword } from "@/app/actions/auth";
import { Lock, Check } from "lucide-react";

export default function UpdatePasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await updatePassword(formData);
      // The action will automatically redirect to the dashboard on success
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update password.");
      setIsPending(false);
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-emerald-600" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2">Secure Your Account</h1>
        <p className="text-sm text-slate-500 font-medium mb-8">
          Please enter your new password below. Make sure it&apos;s something strong that you haven&apos;t used before.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {isPending ? "Saving..." : "Update Password"}
            {!isPending && <Check className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
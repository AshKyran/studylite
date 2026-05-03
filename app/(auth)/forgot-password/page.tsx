// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await requestPasswordReset(formData);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h1>
        
        {success ? (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">
                Check your email! We&apos;ve sent a secure link to reset your password. You can close this window.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Enter the email address associated with your StudyLite account and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="you@university.edu"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending ? "Sending Link..." : "Send Reset Link"}
                {!isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
// app/(auth)/login/page.tsx
"use client";

import { useState, useTransition, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser, loginWithGoogle } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const isNewlyRegistered = searchParams.get("registered") === "true";
  const authError = searchParams.get("error");

  const [error, setError] = useState(authError || "");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const onGoogleLogin = () => {
    setError("");
    startTransition(async () => {
      const result = await loginWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="w-full">
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-blue-600 transition-colors hover:text-blue-500">
            Sign up for free
          </Link>
        </p>
      </div>

      {isNewlyRegistered && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700" role="status" aria-live="polite">
          Account created successfully. Please log in below.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {/* Google Login */}
      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={isPending}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {isPending ? "Connecting..." : "Continue with Google"}
      </button>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 font-medium text-slate-500">Or continue with email</span>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isPending} /* UPGRADE: Lock input during load */
            required
            placeholder="you@example.com"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:opacity-60 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={isPending} /* UPGRADE: Lock input during load */
            required
            placeholder="••••••••"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:opacity-60 disabled:bg-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex w-full justify-center rounded-xl border border-transparent bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-sm font-medium animate-pulse">Loading secure login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
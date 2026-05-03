// app/(auth)/register/page.tsx
"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner"; 
import { registerUser, loginWithGoogle } from "./actions"; 

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerUser(formData);
      
      if (result?.error) {
        // UPGRADE: Using Sonner for error notifications
        toast.error(result.error, {
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }
        });
      } else {
        // Note: The action redirects on success, but just in case it takes a second:
        toast.success("Account created! Redirecting to login...", {
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
        });
      }
    });
  };

  const onGoogleLogin = () => {
    startTransition(async () => {
      const result = await loginWithGoogle();
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="w-full">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-bold text-slate-700">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              disabled={isPending}
              placeholder="John"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:opacity-60 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-bold text-slate-700">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              disabled={isPending}
              placeholder="Doe"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:opacity-60 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
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
            autoComplete="new-password"
            required
            disabled={isPending}
            placeholder="••••••••"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:opacity-60 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-bold text-slate-700">I am joining as a...</label>
          <select
            id="role"
            name="role"
            required
            disabled={isPending}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:opacity-60 disabled:bg-slate-100 appearance-none"
          >
            <option value="STUDENT">Student</option>
            <option value="TUTOR">Tutor / Teacher</option>
            <option value="RESEARCHER">Researcher</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-all active:scale-[0.98] mt-2"
        >
          {isPending ? "Creating your account..." : "Sign up for StudyLite"}
        </button>
      </form>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={isPending}
        className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {isPending ? "Connecting..." : "Continue with Google"}
      </button>
    </div>
  );
}
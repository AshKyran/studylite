"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerUser, loginWithGoogle } from "./actions"; 

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Handle manual form submission via Server Actions
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerUser(formData);
      
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  // Handle Google OAuth submit
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
      
      {/* Header Area */}
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
      
      {/* Alert Messages */}
      {error && (
        <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        
        {/* Name Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors outline-none"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors outline-none"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors outline-none"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors outline-none"
            placeholder="Minimum 8 characters"
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-bold text-slate-700 mb-1.5">I am registering as a...</label>
          <select
            id="role"
            name="role"
            defaultValue="STUDENT"
            className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors outline-none cursor-pointer"
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

      {/* OAuth Divider */}
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={onGoogleLogin}
        className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Sign up with Google
      </button>

    </div>
  );
}
"use client";

import { useState, useTransition } from "react";
import { processSubscription, PlanType } from "../actions/subscription";

export default function PricingPage() {
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleSubscribe = (plan: PlanType) => {
    setLoadingPlan(plan);
    startTransition(async () => {
      try {
        await processSubscription(plan);
      } catch (error) {
        const message = error instanceof Error ? error.message : "An error occurred";
        alert(message);
        setLoadingPlan(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Unlock Unlimited Academic Excellence
          </h1>
          <p className="text-lg text-slate-600 font-medium mb-8">
            Get unrestricted access to premium notes, online tests, and advanced research materials. Choose the plan that fits your study schedule.
          </p>

          {/* FOMO Trial Banner */}
          <div className="inline-flex items-center gap-3 bg-blue-100 border border-blue-200 text-blue-800 px-6 py-3 rounded-full text-sm font-bold shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            Early Adopter Promo: First 100 users get 3 Months VIP Access for FREE!
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* 1. Free Trial Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Free Trial</h3>
              <p className="text-slate-500 text-sm font-medium h-10">Test the waters before committing.</p>
              <div className="mt-6">
                <span className="text-4xl font-black text-slate-900">KES 0</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> First 100 Users: 3 Months VIP
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-slate-400 font-bold">✓</span> Others: 7-Day Restricted Access
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-slate-400 font-bold">✓</span> Basic Notes Access
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("TRIAL")}
              disabled={isPending}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loadingPlan === "TRIAL" ? "Processing..." : "Start Free Trial"}
            </button>
          </div>

          {/* 2. Monthly Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Monthly</h3>
              <p className="text-slate-500 text-sm font-medium h-10">Perfect for short-term revision.</p>
              <div className="mt-6">
                <span className="text-4xl font-black text-slate-900">KES 100</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> Full Library Access
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> Advanced Research Hub
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> Online Test Engine
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("MONTHLY")}
              disabled={isPending}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loadingPlan === "MONTHLY" ? "Processing..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* 3. Quarterly Card (Most Popular) */}
          <div className="bg-blue-600 rounded-3xl p-8 border-2 border-blue-600 shadow-xl flex flex-col relative transform lg:-translate-y-4">
            <div className="absolute top-0 inset-x-0 flex justify-center -mt-3.5">
              <span className="bg-emerald-400 text-slate-900 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </span>
            </div>

            <div className="mb-8 mt-2">
              <h3 className="text-xl font-black text-white mb-2">Quarterly</h3>
              <p className="text-blue-200 text-sm font-medium h-10">Ideal for an entire semester.</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">KES 250</span>
                  <span className="text-blue-200 font-medium">/3 mo</span>
                </div>
                <span className="text-emerald-300 text-sm font-bold mt-1">Save KES 50</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <span className="text-emerald-400 font-bold">✓</span> Everything in Monthly
              </li>
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <span className="text-emerald-400 font-bold">✓</span> Priority Support
              </li>
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <span className="text-emerald-400 font-bold">✓</span> Cheaper than monthly renewal
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("QUARTERLY")}
              disabled={isPending}
              className="w-full py-4 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-black shadow-md transition-colors disabled:opacity-50"
            >
              {loadingPlan === "QUARTERLY" ? "Processing..." : "Subscribe Quarterly"}
            </button>
          </div>

          {/* 4. Yearly Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Yearly</h3>
              <p className="text-slate-500 text-sm font-medium h-10">For serious, long-term learners.</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">KES 1000</span>
                  <span className="text-slate-500 font-medium">/yr</span>
                </div>
                <span className="text-emerald-500 text-sm font-bold mt-1">Save KES 200</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> Everything in Quarterly
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> Best Value for Money
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <span className="text-emerald-500 font-bold">✓</span> Lock in this low price forever
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("YEARLY")}
              disabled={isPending}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loadingPlan === "YEARLY" ? "Processing..." : "Subscribe Yearly"}
            </button>
          </div>

        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-500 font-medium">
            Secure payments via M-Pesa & Cards. Powered by <span className="font-bold text-slate-900">Paystack</span>.
          </p>
        </div>

      </div>
    </div>
  );
}
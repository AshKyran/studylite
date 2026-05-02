"use client";

import { useState, useTransition, useEffect } from "react";
import { processSubscription, PlanType, getSubscriptionStatus } from "../actions/subscription";
import { CheckCircle2, ShieldCheck, Crown, Loader2, Star, Zap } from "lucide-react";

export default function PricingPage() {
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  
  // New state to hold the user's DB status
  const [status, setStatus] = useState<{
    isSubscribed: boolean;
    subscriptionPlan: string | null;
    trialEndsAt: Date | null;
  } | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus().then((data) => {
      setStatus(data);
      setIsPageLoading(false);
    });
  }, []);

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

  if (isPageLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Check if they have an active plan (and aren't just on the restricted 7-day trial)
  const hasActivePremium = status?.isSubscribed && status.subscriptionPlan !== "TRIAL_7_DAY";

  // ==========================================
  // VIEW 1: PREMIUM DASHBOARD (Already Subscribed)
  // ==========================================
  if (hasActivePremium) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Subscription</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your premium StudyLite access.
            </p>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                  <Star className="h-3.5 w-3.5 fill-emerald-400" />
                  Active Subscription
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  {status.subscriptionPlan?.replace(/_/g, ' ')}
                </h2>
                
                <p className="text-slate-400 max-w-md text-sm">
                  Your account is fully upgraded. You have unrestricted access to premium notes, online tests, and advanced research materials.
                </p>
              </div>

              {/* Status Badge */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 min-w-[200px] shadow-inner text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-xl font-black text-white">Verified</p>
                <p className="text-xs text-slate-400 mt-1">Full Access Unlocked</p>
              </div>
            </div>

            <div className="relative z-10 mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
              <button disabled className="bg-slate-800 text-slate-400 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Plan is fully active
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: PRICING GRID (Not Subscribed)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Unlock Unlimited Academic Excellence
          </h1>
          <p className="text-lg text-slate-600 font-medium mb-8">
            Get unrestricted access to premium notes, online tests, and advanced research materials.
          </p>

          {status?.subscriptionPlan === "TRIAL_7_DAY" && (
            <div className="inline-flex items-center gap-3 bg-amber-100 border border-amber-200 text-amber-800 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm">
               <Zap className="h-5 w-5 text-amber-600" />
               You are on the restricted 7-day trial. Upgrade below for full access.
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* 1. Free Trial Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Free Trial</h3>
              <p className="text-slate-500 text-sm font-medium h-10">Test the waters before committing.</p>
              <div className="mt-6">
                <span className="text-4xl font-black text-slate-900">KES 0</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> First 100: 3 Months VIP
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <CheckCircle2 className="h-5 w-5 text-slate-400 shrink-0" /> Others: 7-Day Access
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("TRIAL")}
              disabled={isPending || status?.isSubscribed}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loadingPlan === "TRIAL" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Start Free Trial"}
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
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Full Library Access
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Online Test Engine
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("MONTHLY")}
              disabled={isPending}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loadingPlan === "MONTHLY" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Subscribe Monthly"}
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
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> Everything in Monthly
              </li>
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> Priority Support
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("QUARTERLY")}
              disabled={isPending}
              className="w-full py-4 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-black shadow-md transition-colors disabled:opacity-50"
            >
              {loadingPlan === "QUARTERLY" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Subscribe Quarterly"}
            </button>
          </div>

          {/* 4. Yearly Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Yearly</h3>
              <p className="text-slate-500 text-sm font-medium h-10">For serious learners.</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">KES 1000</span>
                  <span className="text-slate-500 font-medium">/yr</span>
                </div>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <Crown className="h-5 w-5 text-emerald-500 shrink-0" /> Best Value for Money
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Lock in this low price
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("YEARLY")}
              disabled={isPending}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loadingPlan === "YEARLY" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Subscribe Yearly"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
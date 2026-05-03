// app/pricing/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { processSubscription, PlanType, getSubscriptionStatus } from "../actions/subscription";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Crown, 
  Loader2, 
  Star, 
  Zap,
  Rocket
} from "lucide-react";

export default function PricingPage() {
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  
  // Subscription State
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
    }).catch(() => {
      toast.error("Failed to load subscription status.");
      setIsPageLoading(false);
    });
  }, []);

  const handleSubscribe = (plan: PlanType) => {
    if (status?.isSubscribed && status.subscriptionPlan === plan) {
      toast.info("You are already subscribed to this plan.");
      return;
    }

    setLoadingPlan(plan);
    const toastId = toast.loading("Redirecting to secure checkout...");

    startTransition(async () => {
      try {
        await processSubscription(plan);
        toast.success("Checkout initialized successfully!", { id: toastId });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast.error(message, { id: toastId });
        setLoadingPlan(null);
      }
    });
  };

  if (isPageLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">
          Loading Secure Checkout...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-16 sm:py-24 font-sans selection:bg-indigo-200 selection:text-indigo-900 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Secure Payment
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Unlock your full <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">academic potential.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium">
            Get unrestricted access to premium research, the AI Assessment Engine, and priority community support.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* MONTHLY PLAN */}
          <div className={`relative bg-white rounded-3xl border ${status?.subscriptionPlan === "MONTHLY" ? "border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.15)] ring-2 ring-indigo-500 ring-offset-2" : "border-slate-200 shadow-sm hover:shadow-md transition-all"} p-8 sm:p-10 flex flex-col h-full`}>
            {status?.subscriptionPlan === "MONTHLY" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Current Plan
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-500" /> Monthly
              </h3>
              <p className="text-slate-500 font-medium h-10">Flexible access. Cancel anytime.</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">KES 100</span>
                <span className="text-lg font-bold text-slate-400">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Full access to Assessment Engine",
                "Unlock all Premium Research papers",
                "AI Custom Test PDF Generator",
                "Priority Community Q&A answers"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe("MONTHLY")}
              disabled={isPending || status?.subscriptionPlan === "MONTHLY"}
              className={`w-full py-4 rounded-xl font-black text-base transition-all flex justify-center items-center gap-2 ${
                status?.subscriptionPlan === "MONTHLY" 
                  ? "bg-indigo-50 text-indigo-400 cursor-not-allowed border border-indigo-100" 
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95"
              }`}
            >
              {loadingPlan === "MONTHLY" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              ) : status?.subscriptionPlan === "MONTHLY" ? (
                "Active"
              ) : (
                "Subscribe Monthly"
              )}
            </button>
          </div>

          {/* YEARLY PLAN (Highlight) */}
          <div className={`relative bg-slate-900 rounded-3xl border ${status?.subscriptionPlan === "YEARLY" ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-50" : "border-slate-800 shadow-2xl"} p-8 sm:p-10 flex flex-col h-full transform md:-translate-y-4`}>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            {status?.subscriptionPlan === "YEARLY" ? (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md z-10">
                 <CheckCircle2 className="w-3.5 h-3.5" /> Current Plan
               </div>
            ) : (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-indigo-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md z-10">
                <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
              </div>
            )}
            
            <div className="mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-indigo-400" /> Yearly Pro
              </h3>
              <p className="text-slate-400 font-medium h-10">For serious learners. Save 16% annually.</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">KES 1000</span>
                <span className="text-lg font-bold text-slate-500">/yr</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1 relative z-10">
              <li className="flex items-start gap-3 text-slate-300 font-medium">
                <Crown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" /> 
                <span className="text-white font-bold">Everything in Monthly, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" /> 
                <span>Best overall value for money</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" /> 
                <span>Lock in this low introductory price forever</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("YEARLY")}
              disabled={isPending || status?.subscriptionPlan === "YEARLY"}
              className={`w-full py-4 rounded-xl font-black text-base transition-all flex justify-center items-center gap-2 relative z-10 ${
                status?.subscriptionPlan === "YEARLY" 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95"
              }`}
            >
              {loadingPlan === "YEARLY" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              ) : status?.subscriptionPlan === "YEARLY" ? (
                "Active"
              ) : (
                "Subscribe Yearly"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
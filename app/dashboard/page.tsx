import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Fetch all necessary data for the dashboard overview in one query
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      wallet: true,
      _count: {
        select: {
          purchasedNotes: true,
          notesCreated: true,
        }
      }
    }
  });

  if (!user) redirect("/login");

  const isCreator = user.role === "TUTOR" || user.role === "RESEARCHER";

  // --- NEW: Subscription Logic ---
  let daysLeft = null;
  let isTrialExpired = false;
  
  if (user.trialEndsAt) {
    const diffTime = new Date(user.trialEndsAt).getTime() - new Date().getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) isTrialExpired = true;
  }

  const getPlanName = (plan: string | null) => {
    switch(plan) {
      case "MONTHLY": return "Monthly Premium";
      case "QUARTERLY": return "Quarterly Premium";
      case "YEARLY": return "Yearly Premium";
      case "EARLY_ADOPTER_PRO": return "VIP 3-Month Access";
      case "TRIAL_7_DAY": return "7-Day Trial";
      default: return "Premium Member";
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section (Untouched) */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, {user.firstName}!
              </h1>
              {user.isVerified && (
                <span className="bg-blue-100 text-blue-700 p-1 rounded-full" title="Verified Account">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium text-lg">
              {user.role} Account Overview
            </p>
          </div>
          <Link href="/explore" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition transform hover:-translate-y-0.5">
            Explore Marketplace
          </Link>
        </header>

        {/* --- NEW: Subscription Status Banner --- */}
        {!user.isSubscribed ? (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span>🔒</span> Free Tier {isTrialExpired && "(Trial Expired)"}
              </h3>
              <p className="text-slate-300 text-sm mt-1">Upgrade to unlock the Research Hub, Online Tests, and unlimited library access.</p>
            </div>
            <Link href="/pricing" className="shrink-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-colors text-sm">
              Upgrade to Premium
            </Link>
          </div>
        ) : (
          <div className={`p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border ${user.subscriptionPlan?.includes("TRIAL") ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-blue-50 border-blue-200 text-blue-900"}`}>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span>{user.subscriptionPlan?.includes("TRIAL") ? "⏱️" : "✨"}</span> 
                Active Subscription: {getPlanName(user.subscriptionPlan)}
              </h3>
              {user.subscriptionPlan?.includes("TRIAL") && daysLeft !== null && daysLeft > 0 && (
                <p className="opacity-80 text-sm mt-1">Your free access expires in {daysLeft} days. Don&apos;t lose your progress!</p>
              )}
              {!user.subscriptionPlan?.includes("TRIAL") && (
                <p className="opacity-80 text-sm mt-1">You have full access to all premium features.</p>
              )}
            </div>
            {user.subscriptionPlan?.includes("TRIAL") && (
              <Link href="/pricing" className="shrink-0 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-colors text-sm">
                Secure Your Premium Plan
              </Link>
            )}
          </div>
        )}

        {/* Quick Stats Grid (Untouched) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center gap-3 text-slate-600 mb-4">
              <span className="text-2xl">📚</span>
              <h3 className="font-bold text-lg">My Library</h3>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">{user._count.purchasedNotes}</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Materials Owned</p>
            </div>
            <Link href="/dashboard/library" className="mt-4 text-blue-600 font-bold hover:underline text-sm">
              View Collection &rarr;
            </Link>
          </div>

          <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between transform hover:scale-[1.02] transition">
            <div className="flex items-center gap-3 text-emerald-100 mb-4">
              <span className="text-2xl">💳</span>
              <h3 className="font-bold text-lg">Wallet Balance</h3>
            </div>
            <div>
              <p className="text-4xl font-black text-white">
                <span className="text-2xl font-semibold mr-1">Ksh</span>
                {user.wallet?.balance.toLocaleString() || "0.00"}
              </p>
              <p className="text-sm text-emerald-100 font-medium mt-1">Available for withdrawal</p>
            </div>
            <Link href="/dashboard/wallet" className="mt-4 text-white font-bold hover:underline text-sm">
              Manage Wallet &rarr;
            </Link>
          </div>

          {/* Conditional Creator Stat Card */}
          {isCreator ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-slate-600 mb-4">
                <span className="text-2xl">⬆️</span>
                <h3 className="font-bold text-lg">My Uploads</h3>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900">{user._count.notesCreated}</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Published items</p>
              </div>
              <Link href="/dashboard/upload" className="mt-4 text-blue-600 font-bold hover:underline text-sm">
                Manage Uploads &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center">
              <span className="text-3xl mb-3">🎓</span>
              <h3 className="font-bold text-lg text-blue-900 mb-2">Become a Tutor</h3>
              <p className="text-sm text-blue-700 mb-4">Upgrade your account to upload and sell your own notes.</p>
              <Link href="/settings/upgrade" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition">
                Upgrade Now
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
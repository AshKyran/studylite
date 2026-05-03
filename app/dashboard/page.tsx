// app/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, UploadCloud, GraduationCap, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Fetch all necessary data for the dashboard overview
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

  // Subscription Logic
  let daysLeft = 0;
  let isTrialExpired = false;
  
  if (user.trialEndsAt) {
    const diffTime = new Date(user.trialEndsAt).getTime() - new Date().getTime();
    daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Prevent negative days
    if (daysLeft === 0) isTrialExpired = true;
  }

  // Format the Decimal balance safely to prevent React crashes
  const walletBalance = user.wallet?.balance ? Number(user.wallet.balance).toFixed(2) : "0.00";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-slate-500 mt-1">Here is what is happening with your account today.</p>
      </div>

      {/* Trial Alert (If Applicable) */}
      {user.subscriptionPlan === "TRIAL_7_DAY" && !isTrialExpired && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-500" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Trial expiring soon</h4>
              <p className="text-xs text-amber-700">You have {daysLeft} days left on your free trial.</p>
            </div>
          </div>
          <Link href="/pricing" className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-amber-600 transition-colors">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Stat Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Wallet Card */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-16 w-16 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <h3 className="font-bold text-sm tracking-widest uppercase">Available Balance</h3>
          </div>
          <div>
            <p className="text-4xl font-black text-white">
              {user.currency} {walletBalance}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/wallet" className="flex-1 text-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
              Top Up
            </Link>
            {isCreator && (
              <Link href="/dashboard/wallet/withdraw" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                Withdraw
              </Link>
            )}
          </div>
        </div>

        {/* Library Stat Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-600 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">My Library</h3>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">{user._count.purchasedNotes}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">Purchased resources</p>
          </div>
          <Link href="/dashboard/library" className="mt-4 text-emerald-600 font-bold hover:underline text-sm">
            Access Library &rarr;
          </Link>
        </div>

        {/* Creator Stat Card */}
        {isCreator ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center gap-3 text-slate-600 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <UploadCloud className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">My Uploads</h3>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">{user._count.notesCreated}</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Published items</p>
            </div>
            <Link href="/dashboard/upload" className="mt-4 text-purple-600 font-bold hover:underline text-sm">
              Manage Uploads &rarr;
            </Link>
          </div>
        ) : (
          <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center">
            <GraduationCap className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-lg text-blue-900 mb-2">Become a Tutor</h3>
            <p className="text-sm text-blue-700 mb-4">Upgrade your account to upload and sell your own notes.</p>
            <Link href="/dashboard/settings/upgrade" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              Upgrade Account
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
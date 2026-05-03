import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, GraduationCap, MapPin, ShieldCheck, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile, preferences, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4">
              {dbUser.firstName[0]}{dbUser.lastName[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{dbUser.firstName} {dbUser.lastName}</h2>
            <p className="text-sm font-medium text-slate-500 mb-4">{dbUser.role}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4" /> Account Active
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" /> Personal Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
                  <p className="text-slate-900 font-medium">{dbUser.firstName}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                  <p className="text-slate-900 font-medium">{dbUser.lastName}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> Email Address</label>
                <p className="text-slate-900 font-medium">{dbUser.email}</p>
              </div>
            </div>
          </div>

          {/* Academic & Payout details (Visible only if onboarded) */}
          {dbUser.isProfileComplete && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" /> Professional Profile
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Institution</label>
                    <p className="text-slate-900 font-medium">{dbUser.institution}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Qualification</label>
                    <p className="text-slate-900 font-medium">{dbUser.qualification}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Address</label>
                  <p className="text-slate-900 font-medium">{dbUser.address}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> Paystack Payout ID</label>
                  <p className="text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1.5 rounded-lg inline-block">{dbUser.paystackSubaccountCode}</p>
                  <p className="text-xs text-slate-400 mt-2">To change your connected bank account, please contact support.</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
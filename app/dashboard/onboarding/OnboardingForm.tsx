"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeCreatorOnboarding } from "./actions";
import { toast } from "sonner";
import { Building, GraduationCap, MapPin, CreditCard } from "lucide-react";

export default function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    qualification: "Undergraduate",
    institution: "",
    address: "",
    currency: "KES",
    bankCode: "MPESA", // Defaulting to M-Pesa for Kenyan users
    accountNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("Verifying your details with Paystack...");

    const result = await completeCreatorOnboarding(formData);

    toast.dismiss();

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Profile verified successfully!", {
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
      });
      router.push("/dashboard?onboarded=true");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mt-8">
      
      {/* 1. Academic Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" /> Academic Background
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Highest Qualification</label>
            <select name="qualification" value={formData.qualification} onChange={handleChange} disabled={loading} className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3.5 border text-sm transition-all disabled:opacity-60">
              <option value="High School Diploma">High School Diploma</option>
              <option value="Undergraduate">Undergraduate Student</option>
              <option value="Bachelors Degree">Bachelors Degree</option>
              <option value="Masters Degree">Masters Degree</option>
              <option value="PhD">PhD / Doctorate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Institution</label>
            <input required type="text" name="institution" value={formData.institution} onChange={handleChange} disabled={loading} placeholder="e.g., University of Nairobi" className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3.5 border text-sm transition-all disabled:opacity-60" />
          </div>
        </div>
      </div>

      {/* 2. Payout Details */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" /> Payout Settings (Paystack)
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-2">This is where your earnings will be sent when you withdraw.</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Bank / Wallet Provider</label>
            <select name="bankCode" value={formData.bankCode} onChange={handleChange} disabled={loading} className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3.5 border text-sm transition-all disabled:opacity-60">
              <option value="MPESA">M-Pesa</option>
              <option value="044">Access Bank</option>
              <option value="011">First Bank</option>
              <option value="058">GTBank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Account / Phone Number</label>
            <input required type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} disabled={loading} placeholder="e.g., 0712345678" className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3.5 border text-sm transition-all disabled:opacity-60" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">Physical Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input required type="text" name="address" value={formData.address} onChange={handleChange} disabled={loading} placeholder="City, Region, Country" className="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3.5 border text-sm transition-all disabled:opacity-60" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-8 border-t border-slate-100">
        <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
          {loading ? "Securing your profile..." : "Complete Profile & Start Selling"}
        </button>
      </div>
    </form>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeCreatorOnboarding } from "./actions";

export default function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    const result = await completeCreatorOnboarding(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Success! Send them to the dashboard where they can now upload
      router.push("/dashboard?onboarded=true");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Academic Credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Highest Qualification</label>
              <select name="qualification" value={formData.qualification} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white text-sm">
                <option value="High School Graduate">High School Graduate</option>
                <option value="Undergraduate">Undergraduate Student</option>
                <option value="Bachelors Degree">Bachelor&apos;s Degree</option>
                <option value="Masters Degree">Master&apos;s Degree</option>
                <option value="PhD">Ph.D. / Doctorate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Institution / University</label>
              <input required type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="e.g., University of Nairobi" className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Payment & Routing Details</h3>
          <p className="text-xs text-slate-500 mb-4">These details cannot be changed later. All sales earnings will be routed here automatically.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Settlement Method</label>
              <select name="bankCode" value={formData.bankCode} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white text-sm">
                <option value="MPESA">M-Pesa (Safaricom)</option>
                <option value="011000000">KCB Bank</option>
                <option value="068000000">Equity Bank</option>
                <option value="003000000">Absa Bank</option>
                {/* Note: You can add more Paystack Kenya bank codes here */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Account / Phone Number</label>
              <input required type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="e.g., 0712345678 or Bank Account" className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Physical Address</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="City, Region, Country" className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-8 border-t border-slate-100">
        <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:bg-slate-400 transition-all">
          {loading ? "Verifying Details & Creating Account..." : "Lock Profile & Complete Setup"}
        </button>
      </div>
    </form>
  );
}
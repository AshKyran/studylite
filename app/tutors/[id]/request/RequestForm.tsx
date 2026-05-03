// app/tutors/[id]/request/RequestForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitMaterialRequest } from "./actions";
import { toast } from "sonner";
import { ShieldCheck, HelpCircle } from "lucide-react";

interface RequestFormProps {
  tutorId: string;
  tutorName: string;
  baseRate: number;
}

export default function RequestForm({ tutorId, tutorName, baseRate }: RequestFormProps) {
  const router = useRouter();
  
  // Form State
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("PDF");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [offerAmount, setOfferAmount] = useState<number>(baseRate);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Breakdown
  const platformFee = Math.round(offerAmount * 0.05); // 5% platform fee
  const finalTotal = offerAmount + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount < baseRate) {
      toast.error(`Minimum offer for ${tutorName} is KES ${baseRate.toLocaleString()}`);
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Processing your escrow deposit...");

    try {
      const result = await submitMaterialRequest({
        tutorId,
        title,
        format,
        deadline,
        description,
        offerAmount
      });

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setIsSubmitting(false);
      } else {
        toast.success("Commission requested successfully! Funds are now in escrow.", {
          id: toastId,
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
        });
        // Send them to their dashboard to track it
        router.push("/dashboard/requests");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.", { id: toastId });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Title</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} placeholder="e.g. Complete Summary of Chapter 4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Deliverable Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60 appearance-none">
              <option value="PDF">PDF Document</option>
              <option value="ZIP">ZIP Bundle (Code/Data)</option>
              <option value="DOCX">Word Document</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Deadline</label>
            <input required type="date" min={new Date().toISOString().split("T")[0]} value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Detailed Instructions</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} rows={4} placeholder="Describe exactly what you need..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60" />
        </div>
      </div>

      {/* Escrow Financials */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
            Your Offer (KES)
          </label>
          <input required type="number" min={baseRate} value={offerAmount} onChange={(e) => setOfferAmount(Number(e.target.value))} disabled={isSubmitting} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60" />
          <p className="text-xs text-slate-500 mt-1.5">Minimum offer for this expert is KES {baseRate.toLocaleString()}</p>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Base Offer</span>
            <span className="font-bold text-slate-700">KES {offerAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span className="flex items-center gap-1">Platform Escrow Fee <HelpCircle className="w-3.5 h-3.5" /></span>
            <span className="font-bold text-slate-700">KES {platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900">Total Escrow Deposit</span>
            <span className="font-black text-emerald-600">KES {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] text-base font-black text-white bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
        {isSubmitting ? "Securing Funds..." : (
          <>
            <ShieldCheck className="w-5 h-5 mr-2" />
            Secure Checkout & Request
          </>
        )}
      </button>
    </form>
  );
}
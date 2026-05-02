"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitMaterialRequest } from "./actions";

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
  const [error, setError] = useState("");

  // Financial Breakdown
  const platformFee = Math.round(offerAmount * 0.05); // 5% platform fee
  const finalTotal = offerAmount + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount < baseRate) {
      setError(`Minimum offer for ${tutorName} is KES ${baseRate}`);
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const result = await submitMaterialRequest({
        tutorId,
        title,
        format,
        deadline,
        description,
        offerAmount
      });

      if (result.success) {
        // Redirect to a success page or their dashboard orders tab
        router.push(`/dashboard?success=request_sent`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* SECTION 1: The Request Details */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
          <input 
            required 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., Advanced Calculus 101 Summary Notes" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Material Format</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
            >
              <option value="PDF">Detailed PDF Document</option>
              <option value="ZIP_BUNDLE">ZIP Bundle (Code, Data, Docs)</option>
              <option value="THESIS_REVIEW">Thesis/Essay Review (Annotated)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Required Deadline</label>
            <input 
              required 
              type="date" 
              value={deadline} 
              // Prevent picking past dates
              min={new Date().toISOString().split('T')[0]} 
              onChange={(e) => setDeadline(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Instructions</label>
          <textarea 
            required 
            rows={5} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Explain exactly what you need included. The more specific, the better the final result..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />
        </div>
      </div>

      {/* SECTION 2: Financial Offer & Escrow */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Your Offer & Escrow</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">What are you willing to pay? (KES)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">KES</span>
            <input 
              required 
              type="number" 
              min={baseRate}
              value={offerAmount} 
              onChange={(e) => setOfferAmount(Number(e.target.value))} 
              className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Minimum base rate for {tutorName} is KES {baseRate}.</p>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 pt-4 border-t border-slate-200 text-sm">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Creator Payout</span>
            <span>KES {offerAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Platform Escrow Fee (5%)</span>
            <span>KES {platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="font-bold text-slate-900">Total Charged to Wallet</span>
            <span className="text-xl font-black text-emerald-600">KES {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold flex items-center">
          <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] text-base font-black text-white bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Locking Funds & Sending...</span>
          </span>
        ) : (
          `Secure Request • KES ${finalTotal.toLocaleString()}`
        )}
      </button>

      <p className="text-center text-xs text-slate-500 font-medium">
        Your funds are safely held in Escrow. If the creator declines or fails to deliver by the deadline, your wallet is instantly refunded.
      </p>

    </form>
  );
}
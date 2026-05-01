// app/tutors/[id]/book/BookingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingFormProps = {
  tutorId: string;
  tutorName: string;
  hourlyRate: number;
};

export default function BookingForm({ tutorId, tutorName, hourlyRate }: BookingFormProps) {
  const router = useRouter();
  
  // Form State
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [format, setFormat] = useState<string>("virtual");
  const [notes, setNotes] = useState<string>("");
  
  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Derived Values
  const totalCost = hourlyRate * duration;
  const platformFee = totalCost * 0.05; // 5% fee
  const finalTotal = totalCost + platformFee;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError("Please select both a date and a time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In production, this hits your /api/bookings route (which we will build to deduct the wallet)
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, date, time, duration, format, notes, totalCost: finalTotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm booking.");
      }

      setSuccess(true);
      // Redirect to a success page or dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/sessions");
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Booking Confirmed!</h3>
        <p className="text-slate-600 font-medium">
          Your session with {tutorName} has been scheduled. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleBooking} className="space-y-8">
      
      {/* Date & Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Select Date</label>
          <input 
            type="date" 
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            // Basic validation to prevent past dates
            min={new Date().toISOString().split('T')[0]} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Select Time</label>
          <input 
            type="time" 
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Duration & Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Duration</label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => setDuration(hrs)}
                className={`py-3 font-bold rounded-xl text-sm transition-all duration-200 ${
                  duration === hrs 
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-800" 
                    : "border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {hrs} {hrs === 1 ? 'hr' : 'hrs'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Format</label>
          <select 
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
          >
            <option value="virtual">Virtual (Google Meet / Zoom)</option>
            <option value="in_person">In-Person (Requires Tutor Approval)</option>
          </select>
        </div>
      </div>

      {/* Context/Notes */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">What do you want to cover?</label>
        <textarea 
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., I need help understanding Quantum Mechanics Chapter 4..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
        ></textarea>
      </div>

      {/* Cost Breakdown & Checkout */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Payment Summary</h3>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>{hourlyRate} KES x {duration} {duration === 1 ? 'hour' : 'hours'}</span>
            <span>KES {totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Platform Escrow Fee (5%)</span>
            <span>KES {platformFee.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <span className="font-bold text-slate-900">Total Charged to Wallet</span>
          <span className="text-2xl font-black text-slate-900">KES {finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm font-medium text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-start">
          <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
           <span className="flex items-center space-x-2">
           <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <span>Processing Booking...</span>
         </span>
        ) : (
          "Confirm Booking & Pay"
        )}
      </button>

      <p className="text-center text-xs text-slate-500 font-medium">
        Funds will be securely held in escrow. If the mentor declines or misses the session, your wallet will be fully refunded automatically.
      </p>

    </form>
  );
}
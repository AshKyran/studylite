"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PurchaseCardProps = {
  noteId: string;
  price: number;
  // SECURITY NOTE: For production, only pass contentUrl if the note is free 
  // or if the user has already purchased it.
  contentUrl?: string; 
};

export default function PurchaseCard({ noteId, price, contentUrl }: PurchaseCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    setLoading(true);
    setError("");

    try {
      if (price === 0) {
        // Free note logic: We can open the URL directly if provided[cite: 4]
        if (contentUrl) {
          window.open(contentUrl, "_blank");
        } else {
          throw new Error("Download link is unavailable.");
        }
        setLoading(false);
        return;
      }

      // Paid note logic: Initiate secure checkout[cite: 4]
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      // In a production app, the API should return a checkout URL for Paystack/M-Pesa
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; 
      } else if (data.success && contentUrl) {
        // Fallback if bypassing payment gateway for testing
        window.open(contentUrl, "_blank");
        router.refresh();
      } else {
        throw new Error("Invalid response from payment server.");
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during checkout.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col h-full">
      <div className="flex flex-col mb-8">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
          {price === 0 ? "Download Price" : "Purchase Price"}
        </span>
        <span className="text-4xl font-black text-slate-900 tracking-tight">
          {price === 0 ? "FREE" : `KES ${price.toFixed(2)}`}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm font-medium text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-start">
          <svg className="w-5 h-5 mr-2 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleAction}
        disabled={loading}
        className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${
          price === 0 
            ? "bg-slate-900 hover:bg-slate-800 focus:ring-slate-900" 
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
        }`}
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{price === 0 ? "Preparing..." : "Redirecting..."}</span>
          </span>
        ) : price === 0 ? (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Free
          </span>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Checkout Securely
          </span>
        )}
      </button>
    </div>
  );
}
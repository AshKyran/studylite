// components/PurchaseCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PurchaseCardProps = {
  noteId: string;
  price: number;
  contentUrl: string;
};

export default function PurchaseCard({ noteId, price, contentUrl }: PurchaseCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);
    setError("");

    try {
      if (price === 0) {
        // Free note: directly open the Supabase URL in a new tab
        window.open(contentUrl, "_blank");
        setLoading(false);
        return;
      }

      // Paid note: Hit our future purchase API (we will build this next)
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Purchase failed.");
      }

      // On success, open the document and refresh the page state
      window.open(contentUrl, "_blank");
      router.refresh();

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-500 font-medium">Price</span>
        <span className="text-3xl font-extrabold text-gray-900">
          {price === 0 ? "FREE" : `KES ${price.toFixed(2)}`}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </span>
        ) : price === 0 ? (
          "Download Free"
        ) : (
          "Purchase Now"
        )}
      </button>

      <div className="mt-4 flex flex-col space-y-2 text-xs text-gray-500 text-center">
        <p>🔒 Secure payment processing</p>
        <p>✓ Instant access after purchase</p>
      </div>
    </div>
  );
}
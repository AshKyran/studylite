"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import { createClient } from "@/utils/supabase/client";
import { verifyAndFundWallet } from "./actions";

export default function WalletTopUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // Fetch the logged-in student's details for the Paystack receipt
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.id);
      }
    }
    getUser();
  }, [supabase]);

  // Paystack Configuration
  const config = {
    reference: `TOPUP_${new Date().getTime()}_${userId.substring(0, 5)}`,
    email: userEmail,
    amount: amount * 100, // Paystack strictly expects Kobo/Cents (Multiply by 100)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: "KES",
  };

  const initializePayment = usePaystackPayment(config);

  const handleTopUpSuccess = async (reference: { reference: string }) => {
    setIsProcessing(true);
    try {
      await verifyAndFundWallet(reference.reference, userId);
      alert(`Successfully added KES ${amount.toLocaleString()} to your wallet!`);
      router.push("/dashboard/wallet"); // Send them to the wallet page to see the new balance
    } catch (error: unknown) {
      console.error("Top-up verification failed:", error);
      alert("Something went wrong verifying the payment: " + (error instanceof Error ? error.message : String(error)));
      setIsProcessing(false);
    }
  };

  const handleTopUpClose = () => {
    setIsProcessing(false);
  };


  const triggerPayment = () => {
    if (amount < 100) {
      alert("Minimum top-up amount is KES 100");
      return;
    }
    setIsProcessing(true);
    
    // Corrected signature: onSuccess now accepts the reference object Paystack sends
    type PaystackFix = (
      onSuccess: (reference: { reference: string }) => void, 
      onClose: () => void
    ) => void;
    
    (initializePayment as unknown as PaystackFix)(handleTopUpSuccess, handleTopUpClose);
  };

  const presetAmounts = [1000, 2500, 5000, 10000];

  
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        
        <button 
          onClick={() => router.back()}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
          <div className="mb-8 text-center sm:text-left">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fund Your Wallet</h1>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">
              Add funds to securely commission custom materials and projects from verified educators.
            </p>
          </div>

          {/* Amount Selection */}
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Select Amount (KES)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                    }}
                    className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${
                      amount === preset && !customAmount
                        ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">KES</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(Number(e.target.value));
                  }}
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total to Pay</span>
              <span className="text-3xl font-black text-emerald-600">KES {amount.toLocaleString()}</span>
            </div>

            <button
              onClick={triggerPayment}
              disabled={isProcessing || amount < 100 || !userEmail}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none flex justify-center items-center gap-2 group"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (
                <>
                  Secure Checkout via Paystack
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
            
            <p className="text-center text-xs font-bold text-slate-400 mt-5 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Payments are secured and encrypted by Paystack
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
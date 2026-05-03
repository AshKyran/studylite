// app/dashboard/wallet/top-up/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import { createClient } from "@/utils/supabase/client";
import { verifyAndFundWallet } from "./actions";
import { toast } from "sonner"; // UPGRADE: Sonner Toasts added
import { Wallet, CreditCard, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
}

export default function WalletTopUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const presetAmounts = [500, 1000, 2500, 5000];

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

  // Handle Preset Clicks
  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  // Handle Custom Input
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setCustomAmount(val);
      if (val !== "") setAmount(parseInt(val, 10));
    }
  };

  const config = {
    reference: `TOPUP_${new Date().getTime()}_${userId.substring(0, 5)}`,
    email: userEmail,
    amount: amount * 100, // Paystack expects Kobo/Cents
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: "KES",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (response: PaystackResponse) => {
    setIsProcessing(true);
    toast.loading("Verifying your payment...");

    try {
      const result = await verifyAndFundWallet(response.reference, userId);
      
      toast.dismiss(); // Clear loading toast

      if (result.success) {
        toast.success(`Successfully added KES ${result.amount} to your wallet!`, {
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
        });
        router.push("/dashboard/wallet");
      } else {
        toast.error(result.error || "Payment verification failed.");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("A network error occurred while verifying the payment.");
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    toast.info("Payment window closed.");
    setIsProcessing(false);
  };

  const handleTopUp = () => {
    if (amount < 100) {
      toast.error("Minimum top-up amount is KES 100.");
      return;
    }
    if (!userEmail) {
      toast.error("User session not found. Please refresh the page.");
      return;
    }
    
    setIsProcessing(true);
    initializePayment({ onSuccess, onClose });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/wallet" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Fund Wallet</h1>
          <p className="text-slate-500 text-sm mt-1">Add funds securely to purchase notes or hire tutors.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <CreditCard className="w-48 h-48 text-indigo-600" />
        </div>

        <div className="relative z-10 space-y-8">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">Select an amount (KES)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                    amount === preset && customAmount === ""
                      ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <label htmlFor="customAmount" className="block text-sm font-bold text-slate-700 mb-2">Or enter custom amount</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-bold">KES</span>
                <input
                  id="customAmount"
                  type="text"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="e.g. 1500"
                  className="block w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleTopUp}
              disabled={isProcessing || amount < 100}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center gap-3 group active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Pay KES {amount.toLocaleString()} Securely
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Payments are 100% secured and encrypted by Paystack
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
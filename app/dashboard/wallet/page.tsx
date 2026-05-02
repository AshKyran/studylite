import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  // 1. Authenticate User via Supabase
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  // 2. Fetch User AND their Wallet to ensure they have access
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { wallet: true },
  });

  if (!dbUser) redirect("/login");
  if (dbUser.role === "STUDENT") redirect("/dashboard");

  const availableWalletBalance = dbUser.wallet?.balance || 0;

  // 3. Fetch Direct Sales History (Notes & Projects)
  const salesHistory = await prisma.purchase.findMany({
    where: {
      OR: [{ note: { authorId: authUser.id } }, { project: { authorId: authUser.id } }],
    },
    include: {
      note: { select: { title: true } },
      project: { select: { title: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  // 4. Fetch Completed Escrow Commissions
  const commissionHistory = await prisma.materialRequest.findMany({
    where: {
      tutorId: authUser.id,
      status: "DELIVERED",
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
  });

  // 5. Unify and Calculate Financial Metrics
  const CREATOR_CUT_PERCENTAGE = 0.975; // 97.5% for direct sales
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let totalEarnedLifetime = 0;
  let pendingSettlement = 0;
  let earnedToday = 0;

  // We will combine both arrays into one unified transaction list for the UI
  type UnifiedTransaction = {
    id: string;
    title: string;
    buyerName: string;
    amount: number;
    type: "SALE" | "COMMISSION";
    date: Date;
    isPending: boolean;
  };

  const unifiedTransactions: UnifiedTransaction[] = [];

  // Process Direct Sales
  salesHistory.forEach((sale) => {
    const creatorEarnings = sale.amount * CREATOR_CUT_PERCENTAGE;
    const saleDate = new Date(sale.createdAt);
    const isPending = saleDate > twentyFourHoursAgo;

    totalEarnedLifetime += creatorEarnings;
    if (isPending) pendingSettlement += creatorEarnings;
    if (saleDate.toDateString() === now.toDateString()) earnedToday += creatorEarnings;

    unifiedTransactions.push({
      id: sale.id,
      title: sale.note?.title ?? sale.project?.title ?? "Untitled purchase",
      buyerName: `${sale.user.firstName} ${sale.user.lastName}`,
      amount: creatorEarnings,
      type: "SALE",
      date: saleDate,
      isPending,
    });
  });

  // Process Escrow Commissions
  commissionHistory.forEach((commission) => {
    // Escrow fees are taken upfront from the student, so offerAmount is 100% the tutor's
    const creatorEarnings = commission.offerAmount; 
    const deliveryDate = new Date(commission.updatedAt); // Date it was marked delivered

    totalEarnedLifetime += creatorEarnings;
    if (deliveryDate.toDateString() === now.toDateString()) earnedToday += creatorEarnings;
    // Commissions go straight to the digital wallet, so they aren't "Pending T+1" like Paystack sales

    unifiedTransactions.push({
      id: commission.id,
      title: commission.title,
      buyerName: `${commission.student.firstName} ${commission.student.lastName}`,
      amount: creatorEarnings,
      type: "COMMISSION",
      date: deliveryDate,
      isPending: false, // Already settled to Wallet
    });
  });

  // Sort unified transactions newest to oldest
  unifiedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Earnings Ledger</h1>
            <p className="mt-2 text-slate-600 font-medium">
              Track your automated payouts and escrow releases.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold">Automated Payouts Active</span>
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* NEW: Available Wallet Balance */}
          <div className="bg-slate-950 p-6 rounded-2xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</p>
               <h2 className="text-3xl font-black text-white">{formatCurrency(availableWalletBalance)}</h2>
               <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors">
                 Withdraw Funds
               </button>
             </div>
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Earned Today</p>
            <h2 className="text-3xl font-black text-emerald-600">+{formatCurrency(earnedToday)}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Settlement</p>
            <h2 className="text-3xl font-black text-slate-900">{formatCurrency(pendingSettlement)}</h2>
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">T+1 via Paystack</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Lifetime Earned</p>
            <h2 className="text-3xl font-black text-slate-900">{formatCurrency(totalEarnedLifetime)}</h2>
          </div>
        </div>

        {/* Transaction History List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
            <span className="text-sm font-medium text-slate-500">{unifiedTransactions.length} Total</span>
          </div>
          
          {unifiedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl block mb-3">🧾</span>
              <h4 className="text-slate-900 font-bold mb-1">No transactions yet</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Once students purchase your materials or commission custom work, data will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {unifiedTransactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 font-bold ${
                      tx.type === "COMMISSION" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {tx.type === "COMMISSION" ? "C" : "S"}
                    </div>
                    <div>
                     <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                       {tx.title}
                       <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                         tx.type === "COMMISSION" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                       }`}>
                         {tx.type === "COMMISSION" ? "Custom Escrow" : "Direct Sale"}
                       </span>
                     </p>
                      <p className="text-sm text-slate-500 font-medium">From {tx.buyerName}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {tx.date.toLocaleDateString("en-KE", { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                    <p className="text-lg font-black text-slate-900">{formatCurrency(tx.amount)}</p>
                    {tx.isPending ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md mt-1">
                        Pending Payout
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mt-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Settled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
// app/dashboard/wallet/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from "lucide-react";

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

  const availableWalletBalance = dbUser.wallet?.balance ? Number(dbUser.wallet.balance) : 0;

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
    orderBy: { createdAt: "desc" }
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
    orderBy: { updatedAt: "desc" }
  });

  // 5. Combine, Format, and Sort Transactions
  const allTransactions = [
    ...salesHistory.map(sale => ({
      id: sale.id,
      title: sale.note?.title || sale.project?.title || "Digital Product Sale",
      buyerName: `${sale.user.firstName} ${sale.user.lastName}`,
      amount: Number(sale.amount), // UPGRADE: Convert Decimal to Number
      date: new Date(sale.createdAt),
      type: "SALE",
      isPending: false // Direct sales settle immediately
    })),
    ...commissionHistory.map(req => ({
      id: req.id,
      title: `Commission: ${req.title}`,
      buyerName: `${req.student.firstName} ${req.student.lastName}`,
      amount: Number(req.offerAmount), // UPGRADE: Convert Decimal to Number
      date: new Date(req.updatedAt),
      type: "COMMISSION",
      isPending: false // Assuming "DELIVERED" means settled
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // UPGRADE: Safe Math calculation
  const totalEarnings = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: dbUser.currency }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Earnings & Wallet</h1>
        <p className="text-slate-500 mt-1">Manage your balance, track sales, and withdraw funds.</p>
      </div>

      {/* Hero Stats Card */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 pointer-events-none">
          <Wallet className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div>
            <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Available to Withdraw</p>
            <h2 className="text-5xl font-black tracking-tight">{formatCurrency(availableWalletBalance)}</h2>
            
            <div className="mt-8 flex gap-4">
              <Link href="/dashboard/wallet/withdraw" className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Withdraw Funds
              </Link>
            </div>
          </div>
          
          <div className="md:pl-8 pt-8 md:pt-0">
            <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Total All-Time Earnings</p>
            <h3 className="text-3xl font-bold">{formatCurrency(totalEarnings)}</h3>
            <p className="text-sm text-slate-500 mt-2">Includes both direct sales and commissioned work.</p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
        </div>

        {allTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {allTransactions.map((tx) => (
              <div key={tx.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${tx.type === "SALE" ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"}`}>
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{tx.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">Purchased by {tx.buyerName}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {tx.date.toLocaleDateString("en-KE", { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                  <p className="text-lg font-black text-slate-900">+{formatCurrency(tx.amount)}</p>
                  {tx.isPending ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg mt-1">
                      <Clock className="w-3.5 h-3.5" /> Pending Payout
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h4 className="text-slate-900 font-bold text-lg">No transactions yet</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">When students purchase your notes or approve your commissioned work, the funds will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
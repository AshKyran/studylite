import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function WalletPage() {
  // 1. Authenticate User via Supabase
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  // 2. Fetch User to ensure they have access
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, isProfileComplete: true },
  });

  if (!dbUser) redirect("/login");

  // If a student tries to access the wallet, send them back to the dashboard
  if (dbUser.role === "STUDENT") {
    redirect("/dashboard");
  }

  // 3. Fetch all Sales History from the Purchase Ledger
  const salesHistory = await prisma.purchase.findMany({
    where: {
      note: {
        authorId: authUser.id,
      },
    },
    include: {
      note: {
        select: { title: true },
      },
      user: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4. Calculate Financial Metrics (97.5% Creator Cut)
  const CREATOR_CUT_PERCENTAGE = 0.975;
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let totalEarned = 0;
  let pendingSettlement = 0;
  let earnedToday = 0;

  salesHistory.forEach((sale) => {
    const creatorEarnings = sale.amount * CREATOR_CUT_PERCENTAGE;
    const saleDate = new Date(sale.createdAt);

    totalEarned += creatorEarnings;

    // Any sale made in the last 24 hours is considered "Pending" for Paystack's T+1 payout
    if (saleDate > twentyFourHoursAgo) {
      pendingSettlement += creatorEarnings;
    }

    // Checking sales specifically for today's calendar date
    if (saleDate.toDateString() === now.toDateString()) {
      earnedToday += creatorEarnings;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Earnings Ledger</h1>
            <p className="mt-2 text-slate-600 font-medium">
              Track your automated payouts. Funds are settled directly to your connected account.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earned */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Earned (Lifetime)</p>
            <h2 className="text-3xl font-black text-slate-900">{formatCurrency(totalEarned)}</h2>
          </div>

          {/* Pending Settlement */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-md border border-slate-700 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">Pending Settlement</p>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">T+1</span>
              </div>
              <h2 className="text-3xl font-black text-white">{formatCurrency(pendingSettlement)}</h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">Depositing within 24 hours</p>
            </div>
            {/* Background design */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-500 opacity-20"></div>
          </div>

          {/* Earned Today */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Earned Today</p>
            <h2 className="text-3xl font-black text-emerald-600">+{formatCurrency(earnedToday)}</h2>
          </div>
        </div>

        {/* Transaction History List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
            <span className="text-sm font-medium text-slate-500">{salesHistory.length} Total Sales</span>
          </div>
          
          {salesHistory.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl block mb-3">🧾</span>
              <h4 className="text-slate-900 font-bold mb-1">No transactions yet</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Once students begin purchasing your materials, your sales data will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {salesHistory.map((sale) => {
                const creatorCut = sale.amount * CREATOR_CUT_PERCENTAGE;
                const isPending = new Date(sale.createdAt) > twentyFourHoursAgo;

                return (
                  <div key={sale.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-1 font-bold">
                        {sale.user.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{sale.note.title}</p>
                        <p className="text-sm text-slate-500 font-medium">
                          Purchased by {sale.user.firstName} {sale.user.lastName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(sale.createdAt).toLocaleDateString("en-KE", { 
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                      <p className="text-lg font-black text-slate-900">
                        {formatCurrency(creatorCut)}
                      </p>
                      {isPending ? (
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
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
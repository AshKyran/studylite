import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Secure the dashboard using Supabase Auth
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  // 2. Fetch the user's profile from Prisma to determine their Role
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  if (!user) {
    redirect("/login?error=ProfileNotFound");
  }

  // Check if user is a creator (Tutor or Researcher) to show specific menu items
  const isCreator = user.role === "TUTOR" || user.role === "RESEARCHER";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-black text-slate-900 tracking-tight">
            Studylite<span className="text-blue-600">.</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1 space-y-2 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Menu
          </div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition font-medium">
            <span className="text-xl">📊</span> Overview
          </Link>
          <Link href="/dashboard/library" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition font-medium">
            <span className="text-xl">📚</span> My Library
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition font-medium">
            <span className="text-xl">💳</span> Wallet
          </Link>
          
          {isCreator && (
            <Link href="/dashboard/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition font-medium">
              <span className="text-xl">⬆️</span> Upload Work
            </Link>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          {/* Note: This should ideally be a client component button that calls Supabase signOut, 
              but for layout purposes, linking to a logout route works too */}
          <Link href="/auth/logout" className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
            <span className="text-lg">🚪</span> Sign Out
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full md:ml-64 pb-20 md:pb-0">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 safe-area-pb">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">📊</span>
          <span className="text-[10px] font-medium">Overview</span>
        </Link>
        <Link href="/dashboard/library" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">📚</span>
          <span className="text-[10px] font-medium">Library</span>
        </Link>
        <Link href="/dashboard/wallet" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">💳</span>
          <span className="text-[10px] font-medium">Wallet</span>
        </Link>
        {isCreator && (
          <Link href="/dashboard/upload" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
            <span className="text-xl mb-1">⬆️</span>
            <span className="text-[10px] font-medium">Upload</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
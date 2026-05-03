// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Library, 
  Wallet, 
  UploadCloud, 
  LogOut, 
  Settings,
  GraduationCap
} from "lucide-react";

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

  // 2. Fetch the user's profile
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  if (!user) {
    redirect("/login?error=ProfileNotFound");
  }

  const isCreator = user.role === "TUTOR" || user.role === "RESEARCHER";

  // 3. Inline Server Action for secure Logout
  async function handleSignOut() {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800">
        <div className="p-6">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">
            Studylite<span className="text-indigo-500">.</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-semibold text-sm">Overview</span>
          </Link>
          <Link href="/dashboard/library" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <Library className="h-5 w-5" />
            <span className="font-semibold text-sm">Library</span>
          </Link>
          
          {isCreator ? (
             <Link href="/dashboard/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
               <UploadCloud className="h-5 w-5 text-purple-400" />
               <span className="font-semibold text-sm text-purple-400">Upload Center</span>
             </Link>
          ) : (
            <Link href="/tutors" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
              <GraduationCap className="h-5 w-5" />
              <span className="font-semibold text-sm">Find Tutors</span>
            </Link>
          )}

          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <Wallet className="h-5 w-5" />
            <span className="font-semibold text-sm">Wallet</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <Settings className="h-5 w-5" />
            <span className="font-semibold text-sm">Settings</span>
          </Link>
          
          {/* UPGRADE: Use a proper form for server actions in Server Components */}
          <form action={handleSignOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <Link href="/" className="text-xl font-black text-slate-900 tracking-tight">
            Studylite<span className="text-indigo-500">.</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs uppercase">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <nav className="flex justify-around items-center px-2 py-3">
          <Link href="/dashboard" className="flex flex-col items-center p-2 text-slate-500 hover:text-indigo-600 transition-colors">
            <LayoutDashboard className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          <Link href="/dashboard/library" className="flex flex-col items-center p-2 text-slate-500 hover:text-indigo-600 transition-colors">
            <Library className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Library</span>
          </Link>

          {isCreator ? (
            <Link href="/dashboard/upload" className="flex flex-col items-center p-2 text-slate-500 hover:text-purple-600 transition-colors">
              <div className="bg-purple-100 p-2.5 rounded-full -mt-6 border-4 border-white shadow-sm">
                <UploadCloud className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold mt-1 text-purple-600">Upload</span>
            </Link>
          ) : (
            <Link href="/dashboard/wallet" className="flex flex-col items-center p-2 text-slate-500 hover:text-blue-600 transition-colors">
              <div className="bg-blue-100 p-2.5 rounded-full -mt-6 border-4 border-white shadow-sm">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-bold mt-1 text-blue-600">Wallet</span>
            </Link>
          )}

          <Link href="/dashboard/settings" className="flex flex-col items-center p-2 text-slate-500 hover:text-indigo-600 transition-colors">
            <Settings className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Settings</span>
          </Link>
          
          <form action={handleSignOut} className="flex">
            <button type="submit" className="flex flex-col items-center p-2 text-red-400 hover:text-red-500 transition-colors">
              <LogOut className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-bold">Exit</span>
            </button>
          </form>
        </nav>
      </div>

    </div>
  );
}
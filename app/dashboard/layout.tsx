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
  BookOpen,
  Settings,
  Briefcase,
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

  // 2. Fetch the user's profile from Prisma
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  if (!user) {
    redirect("/login?error=ProfileNotFound");
  }

  // Check if user is a creator (Tutor or Researcher)
  const isCreator = user.role === "TUTOR" || user.role === "RESEARCHER";

  // 3. Inline Server Action for secure Logout
  async function handleSignOut() {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row selection:bg-blue-200 selection:text-blue-900 relative">
      
      {/* ==========================================
          DESKTOP SIDEBAR
          ========================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 z-40 shadow-sm">
        
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              StudyLite.
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hide-scrollbar">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Menu</p>
          
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-bold transition-all group">
            <LayoutDashboard className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
            Overview
          </Link>
          
          <Link href="/dashboard/library" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-bold transition-all group">
            <Library className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
            My Library
          </Link>
          
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-bold transition-all group">
            <Wallet className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
            Virtual Wallet
          </Link>

          {/* Creator / Tutor Only Links */}
          {isCreator && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Creator Tools</p>
              </div>
              <Link href="/dashboard/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 font-bold transition-all group">
                <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-purple-600" />
                Upload Material
              </Link>
              <Link href="/dashboard/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 font-bold transition-all group">
                <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-purple-600" />
                Tutor Jobs
              </Link>
            </>
          )}

          {/* Student Specific */}
          {!isCreator && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Learning</p>
              </div>
              <Link href="/tutors" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold transition-all group">
                <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
                Find a Tutor
              </Link>
            </>
          )}
        </nav>

        {/* User Profile & Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold transition-all group mb-1">
            <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
            Settings
          </Link>
          
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-black shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</span>
                <span className="text-xs font-medium text-slate-500 truncate capitalize">{user.role.toLowerCase()}</span>
              </div>
            </div>
            
            {/* Functional Desktop Logout Button */}
            <form action={handleSignOut}>
              <button type="submit" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Sign Out">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      <main className="flex-1 w-full pb-20 md:pb-0 min-h-screen flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-md">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">StudyLite.</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user.firstName[0]}
            </div>
            {/* Functional Mobile Logout Button */}
            <form action={handleSignOut}>
              <button type="submit" className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Sign Out">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION
          ========================================== */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 py-2">
          
          <Link href="/dashboard" className="flex flex-col items-center p-2 text-slate-500 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Overview</span>
          </Link>
          
          <Link href="/dashboard/library" className="flex flex-col items-center p-2 text-slate-500 hover:text-blue-600 transition-colors">
            <Library className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Library</span>
          </Link>

          {isCreator ? (
            <Link href="/dashboard/upload" className="flex flex-col items-center p-2 text-slate-500 hover:text-purple-600 transition-colors">
              <div className="bg-purple-100 p-1.5 rounded-full -mt-4 border-2 border-white shadow-sm">
                <UploadCloud className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">Upload</span>
            </Link>
          ) : (
            <Link href="/tutors" className="flex flex-col items-center p-2 text-slate-500 hover:text-emerald-600 transition-colors">
              <GraduationCap className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-bold">Tutors</span>
            </Link>
          )}
          
          <Link href="/dashboard/wallet" className="flex flex-col items-center p-2 text-slate-500 hover:text-blue-600 transition-colors">
            <Wallet className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Wallet</span>
          </Link>

          <Link href="/dashboard/settings" className="flex flex-col items-center p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <Settings className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Settings</span>
          </Link>

        </div>
      </nav>

    </div>
  );
}

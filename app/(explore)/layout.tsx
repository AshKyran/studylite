// app/explore/layout.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  LogOut, 
  Library, 
  Rocket, 
  ClipboardCheck, 
  MessagesSquare, 
  Microscope,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "Explore | StudyLite",
  description: "Discover top-tier notes, projects, and assessments.",
};

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Fail gracefully if auth service has a hiccup, rather than crashing the layout
  if (error) {
    console.error("Auth error in Explore Layout:", error.message);
  }

  // Inline Server Action for logging out seamlessly
  async function handleSignOut() {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 relative font-sans">
      
      {/* 
        MASTER SIDEBAR NAVIGATION 
        Uses strict flex-col to ensure the profile section stays glued to the bottom
      */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0 md:sticky md:top-0 md:h-screen hidden md:flex md:flex-col shadow-xl z-20">
        
        {/* TOP: Logo Area */}
        <div className="p-6 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 text-white hover:text-blue-400 transition-colors group">
            <GraduationCap className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black tracking-tight">Studylite</span>
          </Link>
        </div>

        {/* MIDDLE: Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-8 pb-6 scrollbar-hide">
          
          {/* Core Academic Materials */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Marketplace</p>
            <div className="space-y-1.5">
              <Link href="/explore" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] group">
                <Library className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="font-semibold text-sm">Notes & Papers</span>
              </Link>
              <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] group">
                <Rocket className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="font-semibold text-sm">Advanced Projects</span>
              </Link>
            </div>
          </div>

          {/* Interactive & Assessment */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Assessments</p>
            <div className="space-y-1.5">
              <Link href="/tests" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  <span className="font-semibold text-sm">Online Tests</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">LIVE</span>
              </Link>
            </div>
          </div>

          {/* Community & Collaboration */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Community</p>
            <div className="space-y-1.5">
              <Link href="/community" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] group">
                <MessagesSquare className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="font-semibold text-sm">Q&A Forum</span>
              </Link>
              <Link href="/research" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] group">
                <Microscope className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                <span className="font-semibold text-sm">Research Hub</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* BOTTOM: User Account / Log Out */}
        <div className="mt-auto shrink-0 p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
          {user ? (
            <div className="flex items-center justify-between gap-2 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50 shadow-inner">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1 pl-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm shadow-md">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-white truncate">Dashboard</p>
                  <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{user.email?.split('@')[0]}</p>
                </div>
              </Link>
              
              {/* Logout Button */}
              <form action={handleSignOut}>
                <button 
                  type="submit" 
                  title="Sign out"
                  className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shrink-0 active:scale-90"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
             <Link href="/login" className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-blue-900/20 active:scale-[0.98]">
               Sign in to StudyLite
             </Link>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50 h-screen overflow-y-auto">
        
        {/* Mobile Header (Sticky on phones) */}
        <div className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shadow-md">
           <Link href="/" className="text-white text-xl font-black flex items-center gap-2">
             <GraduationCap className="w-6 h-6 text-blue-500" />
             <span>Studylite</span>
           </Link>
           {/* Quick Mobile Profile Access */}
           {user ? (
             <Link href="/dashboard" className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm active:scale-95 transition-transform">
               {user.email?.[0].toUpperCase() || "U"}
             </Link>
           ) : (
             <Link href="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300">
               Sign In
             </Link>
           )}
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
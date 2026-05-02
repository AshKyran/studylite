import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react"; // Make sure lucide-react is installed

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Inline Server Action for logging out seamlessly
  async function handleSignOut() {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 relative">
      
      {/* MASTER SIDEBAR NAVIGATION 
        Uses Flexbox (flex-col) to ensure the bottom profile section NEVER overlaps 
        the global footer or hides behind scrollable content.
      */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0 md:sticky md:top-0 md:h-screen hidden md:flex md:flex-col">
        
        {/* TOP: Logo Area (Fixed) */}
        <div className="p-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-black tracking-tight">Studylite</span>
          </Link>
        </div>

        {/* MIDDLE: Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-8 pb-6">
          
          {/* Core Academic Materials */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Marketplace</p>
            <div className="space-y-1">
              <Link href="/explore" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span className="font-semibold text-sm">Notes & Papers</span>
              </Link>
              <Link href="/explore/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="font-semibold text-sm">4th Year Projects</span>
              </Link>
            </div>
          </div>

          {/* Interactive & Assessment */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Assessments</p>
            <div className="space-y-1">
              <Link href="/explore/tests" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-semibold text-sm">Online Tests</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-md">LIVE</span>
              </Link>
            </div>
          </div>

          {/* Community & Collaboration */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Community</p>
            <div className="space-y-1">
              <Link href="/explore/forum" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                <span className="font-semibold text-sm">Q&A Forum</span>
              </Link>
              <Link href="/explore/research" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <span className="font-semibold text-sm">Research Hub</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* BOTTOM: User Account / Log Out (Fixed at bottom via mt-auto) */}
        <div className="mt-auto shrink-0 p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
          {user ? (
            <div className="flex items-center justify-between gap-2 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1 pl-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm shadow-inner">
                  {user.email?.[0].toUpperCase()}
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
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
             <Link href="/login" className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.98]">
               Sign in to StudyLite
             </Link>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header (Sticky on phones) */}
        <div className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shadow-sm">
           <Link href="/" className="text-white text-xl font-black flex items-center gap-2">
             <span>🎓</span> Studylite
           </Link>
           {/* Quick Mobile Profile Access */}
           {user ? (
             <Link href="/dashboard" className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
               {user.email?.[0].toUpperCase()}
             </Link>
           ) : (
             <Link href="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300">
               Sign In
             </Link>
           )}
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
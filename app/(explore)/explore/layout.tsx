import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* MASTER SIDEBAR NAVIGATION 
        This persists across all Explore sub-routes (Notes, Projects, Tests, Forum)
      */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto hidden md:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8 text-white">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-black tracking-tight">Studylite</span>
          </Link>

          <nav className="space-y-6">
            
            {/* Core Academic Materials */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Marketplace</p>
              <div className="space-y-1">
                <Link href="/explore" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <span className="font-medium text-sm">Notes & Papers</span>
                </Link>
                <Link href="/explore/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="font-medium text-sm">4th Year Projects</span>
                </Link>
              </div>
            </div>

            {/* Interactive & Assessment */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Assessments</p>
              <div className="space-y-1">
                <Link href="/explore/tests" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium text-sm">Online Tests & Exams</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">LIVE</span>
                </Link>
              </div>
            </div>

            {/* Community & Collaboration */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Community</p>
              <div className="space-y-1">
                <Link href="/explore/forum" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                  <span className="font-medium text-sm">Q&A Forum</span>
                </Link>
                <Link href="/explore/research" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  <span className="font-medium text-sm">Research Hub</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* User Account / Login Status at bottom of sidebar */}
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">My Dashboard</p>
                <p className="text-xs text-slate-400">Library & Settings</p>
              </div>
            </Link>
          ) : (
             <Link href="/login" className="block w-full py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
               Sign In
             </Link>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA 
        This is where the actual pages (/explore, /explore/projects, etc.) render 
      */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header (Only shows on phones) */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
           <Link href="/" className="text-white text-xl font-black flex items-center gap-2">
             <span>🎓</span> Studylite
           </Link>
           {/* You can add a mobile hamburger menu button here later */}
        </div>

        {/* Dynamic Page Content */}
        {children}
      </main>

    </div>
  );
}
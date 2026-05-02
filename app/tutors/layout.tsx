import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { 
  ShieldCheck, 
  Search, 
  Briefcase, 
  ChevronLeft,
  GraduationCap
} from "lucide-react";

export default async function TutorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-200 selection:text-blue-900">
      
      {/* ==========================================
          TUTOR MARKETPLACE HEADER
          ========================================== */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        
        {/* Main Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand & Back Button */}
          <div className="flex items-center gap-6">
            <Link href="/explore" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Explore</span>
            </Link>
            
            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
            
            <Link href="/tutors" className="flex items-center gap-2 group">
              <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <GraduationCap className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">Expert Tutors</span>
            </Link>
          </div>

          {/* Right: Trust Badge & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Escrow Protected</span>
            </div>

            {user ? (
              <Link href="/dashboard" className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm hover:opacity-80 transition-opacity text-sm border border-blue-500">
                {user.email?.[0].toUpperCase()}
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* ==========================================
            SUB-NAVIGATION TABS
            ========================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
            <Link 
              href="/tutors" 
              className="flex items-center gap-2 py-4 text-sm font-bold text-white border-b-2 border-emerald-500 whitespace-nowrap"
            >
              <Search className="h-4 w-4 text-emerald-400" />
              Find a Tutor
            </Link>
            
            <Link 
              href="/tutors/requests" 
              className="flex items-center gap-2 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-slate-700 whitespace-nowrap"
            >
              <Briefcase className="h-4 w-4" />
              My Hiring Requests
            </Link>

            <Link 
              href="/tutors/guide" 
              className="flex items-center gap-2 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-slate-700 whitespace-nowrap"
            >
              <ShieldCheck className="h-4 w-4" />
              How Escrow Works
            </Link>
          </nav>
        </div>
      </header>

      {/* ==========================================
          GLOBAL TRUST BANNER (Optional, dismissible in future)
          ========================================== */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm text-emerald-800 font-medium text-center">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <p>
            <strong className="font-black">100% Safe Hiring.</strong> Funds are held in StudyLite Escrow until you are satisfied with the delivery.
          </p>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT AREA (Where the grid goes)
          ========================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}
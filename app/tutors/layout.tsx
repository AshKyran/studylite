// app/tutors/layout.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { 
  ShieldCheck, 
  Briefcase, 
  ChevronLeft,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "Hire a Tutor | StudyLite",
  description: "Find verified academic experts, researchers, and tutors.",
};

export default async function TutorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // Safe fetch - will return null if no session, which is perfectly fine for public directories
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-200 selection:text-indigo-900">
      
      {/* ==========================================
          TUTOR MARKETPLACE HEADER
          ========================================== */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand & Back Button */}
          <div className="flex items-center gap-6">
            <Link href="/explore" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Explore</span>
            </Link>
            
            <div className="hidden sm:block h-6 w-px bg-slate-800"></div>
            
            <Link href="/tutors" className="flex items-center gap-2 text-white group">
              <GraduationCap className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="font-black tracking-tight text-lg hidden sm:inline">Tutor Directory</span>
            </Link>
          </div>

          {/* Right: User Actions */}
          <nav className="flex items-center gap-6">
            {user ? (
              <Link 
                href="/dashboard/requests" 
                className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                My Hiring Requests
              </Link>
            ) : null}

            <Link 
              href="/tutors/guide" 
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              How Escrow Works
            </Link>
          </nav>
        </div>
      </header>

      {/* ==========================================
          GLOBAL TRUST BANNER 
          ========================================== */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm text-emerald-800 font-medium text-center">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <p>
            <strong className="font-black">100% Safe Hiring.</strong> Funds are held in StudyLite Escrow until you are satisfied with the delivery.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
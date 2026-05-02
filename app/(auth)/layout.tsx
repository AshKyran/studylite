import Link from "next/link";
import { BookOpen, GraduationCap, Users, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white">
      
      {/* Left Side: The Form Area */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[45%]">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          {/* Logo & Home Link */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="bg-blue-600 p-2.5 rounded-xl group-hover:bg-blue-700 transition-colors">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                StudyLite.
              </span>
            </Link>
          </div>

          {/* The Login or Register form gets injected exactly here */}
          {children}
          
        </div>
      </div>

      {/* Right Side: Marketing / Branding Panel (Hidden on Mobile) */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-between bg-slate-900 px-12 py-20 xl:px-24">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Elevate your academic journey today.
          </h2>
          <p className="text-lg text-slate-400 mb-12 font-medium">
            Join thousands of students, tutors, and researchers accessing premium study materials and top-tier academic support.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                <GraduationCap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Premium Resources</h3>
                <p className="text-slate-400 text-sm mt-1">Get unrestricted access to verified notes, past papers, and online tests.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Expert Tutors</h3>
                <p className="text-slate-400 text-sm mt-1">Connect with specialized educators for personalized escrow-backed tutoring.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                <ShieldCheck className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Secure Platform</h3>
                <p className="text-slate-400 text-sm mt-1">Your data and wallet transactions are protected by bank-level security.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Testimonial Area */}
        <div className="relative z-10 mt-20 pt-8 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600"></div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-500 flex items-center justify-center text-xs font-bold text-white">+2k</div>
            </div>
            <p className="text-sm font-medium text-slate-400">
              Trusted by students across <span className="text-white font-bold">150+ institutions</span>.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
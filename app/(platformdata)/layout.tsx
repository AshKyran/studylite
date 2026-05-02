import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SiGithub, SiLinkerd } from "react-icons/si";

import { BookOpen, X ,  Mail } from "lucide-react";

export default async function PlatformDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      
      {/* ==========================================
          STICKY HEADER (Marketing / Public Nav)
          ========================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              StudyLite.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              About Us
            </Link>
            <Link href="/pricing" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/explore" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Explore
            </Link>
            <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Calls to Action */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      <main className="flex-1 w-full">
        {/* Your /about, /contact, /privacy pages inject here */}
        {children}
      </main>

      {/* ==========================================
          RICH PLATFORM FOOTER
          ========================================== */}
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🎓</span>
                <span className="text-2xl font-black text-white tracking-tight">StudyLite</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8 font-medium">
                Elevating academic excellence through peer-to-peer collaboration, premium resources, and secure escrow-backed tutoring.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                  <X className="h-5 w-5" />
                </a>
                <a href="#" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                  <SiGithub className="h-5 w-5" />
                </a>
                <a href="#" className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                  <SiLinkerd className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="text-white font-bold mb-5 tracking-wide">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/explore" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Marketplace</Link></li>
                <li><Link href="/explore/forum" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Q&A Forum</Link></li>
                <li><Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link></li>
                <li><Link href="/tutors" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Find a Tutor</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-5 tracking-wide">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-5 tracking-wide">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Cookie Policy</Link></li>
                <li><Link href="/refunds" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-medium text-center md:text-left">
              &copy; {new Date().getFullYear()} StudyLite Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
               Made with <span className="text-red-500">♥</span> in Kenya
            </div>
          </div>

        </div>
      </footer>
      
    </div>
  );
}
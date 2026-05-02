"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();


  return (
    <footer className="bg-slate-950 border-t border-slate-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site Footer</h2>
      
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          
          {/* Brand & Platform Mission */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="inline-block text-3xl font-extrabold text-white tracking-tight">
              Studylite<span className="text-indigo-500">.</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The ultimate academic ecosystem. From high school revision to advanced collegiate research, we provide the tools, tutors, and materials to elevate your intellect.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-5">
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Links Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Solutions</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link href="/explore" className="text-sm text-slate-400 hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link href="/tutors" className="text-sm text-slate-400 hover:text-white transition-colors">Find a Tutor</Link></li>
                  <li><Link href="/exams" className="text-sm text-slate-400 hover:text-white transition-colors">Online Exams</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/careers" className="text-sm text-slate-400 hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing & Wallet</Link></li>
                  <li><Link href="/help" className="text-sm text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} Studylite Platform Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-600 font-medium">Secured by</span>
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold tracking-wider">PAYSTACK</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
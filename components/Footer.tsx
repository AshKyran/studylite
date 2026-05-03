// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site Footer</h2>
      
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-24 lg:px-8">
        {/* UPGRADED RESPONSIVENESS: Better grid handling for tablet (md) and desktop (xl) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          
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
                {/* SVG goes here */}
              </a>
            </div>
          </div>

          {/* Quick Links Grouping */}
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing & Wallet</Link></li>
                <li><Link href="/help" className="text-sm text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
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
              <div className="h-6 w-16 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold tracking-wider">
                PAYSTACK
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
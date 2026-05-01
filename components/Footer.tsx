import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site Footer
      </h2>
      
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          
          {/* Brand & Platform Mission */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="inline-block text-3xl font-extrabold text-white tracking-tight">
              Studylite<span className="text-blue-500">.</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The ultimate academic ecosystem. From high school revision to advanced collegiate research, we provide the tools, tutors, and materials to elevate your intellect.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-5">
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="X (Twitter)">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* SEO Navigational Columns */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Study & Learn */}
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Study & Learn</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link href="/explore" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Marketplace Notes</Link></li>
                  <li><Link href="/exams" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Online Revision Tests</Link></li>
                  <li><Link href="/qa" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Community Q&A</Link></li>
                  <li><Link href="/high-school" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">High School Guides</Link></li>
                  <li><Link href="/college" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">College Curriculums</Link></li>
                </ul>
              </div>
              
              {/* Experts & Research */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Experts & Research</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link href="/tutors" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Find a Local Tutor</Link></li>
                  <li><Link href="/online-tutors" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Online 1-on-1 Sessions</Link></li>
                  <li><Link href="/research" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Academic Research Hub</Link></li>
                  <li><Link href="/dissertations" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Peer-Reviewed Papers</Link></li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* For Educators */}
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">For Educators</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link href="/register?role=educator" className="text-sm text-slate-400 hover:text-white transition-colors">Apply to Teach</Link></li>
                  <li><Link href="/publish" className="text-sm text-slate-400 hover:text-white transition-colors">Publish Study Notes</Link></li>
                  <li><Link href="/research-guidelines" className="text-sm text-slate-400 hover:text-white transition-colors">Research Guidelines</Link></li>
                  <li><Link href="/educator-terms" className="text-sm text-slate-400 hover:text-white transition-colors">Educator Terms</Link></li>
                </ul>
              </div>
              
              {/* Support & Legal */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Support & Legal</h3>
                <ul className="mt-6 space-y-4">
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
            {/* Replace with your actual payment gateway logos (e.g., Paystack, M-Pesa) */}
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold">PAYSTACK</div>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
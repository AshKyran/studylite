import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      
      {/* 1. HERO SECTION: Services pushed ABOVE the fold */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white border-b border-slate-200">
        {/* Subtle grid background for academic/tech feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight max-w-4xl">
            Master your academic journey with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Studylite.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
            The all-in-one ecosystem for ambitious minds. Connect with verified tutors, access peer-reviewed notes, and conquer your next exam.
          </p>

          {/* QUICK ACTION DASHBOARD: Immediately visible services */}
          <div className="w-full max-w-5xl bg-white p-4 md:p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4 z-20">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">What do you need today?</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Pillar 1: Notes */}
              <Link href="/explore" className="group flex flex-col items-start p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Study Notes</h3>
                <p className="text-sm text-slate-500 text-left">Buy & sell premium study materials.</p>
              </Link>

              {/* Pillar 2: Tutors */}
              <Link href="/tutors" className="group flex flex-col items-start p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Find a Tutor</h3>
                <p className="text-sm text-slate-500 text-left">1-on-1 sessions with verified experts.</p>
              </Link>

              {/* Pillar 3: Exams */}
              <Link href="/exams" className="group flex flex-col items-start p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Online Tests</h3>
                <p className="text-sm text-slate-500 text-left">Revision exams and multiple-choice quizzes.</p>
              </Link>

              {/* Pillar 4: Q&A */}
              <Link href="/qa" className="group flex flex-col items-start p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Community Q&A</h3>
                <p className="text-sm text-slate-500 text-left">Get answers to complex academic questions.</p>
              </Link>

            </div>

            {/* Global CTA below the action cards */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 font-medium">Join thousands of students and educators.</p>
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors text-sm flex items-center justify-center"
              >
                Create a Free Account
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. ADVANCED RESEARCH & ACADEMIA SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="lg:w-1/2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs mb-6 tracking-wide uppercase">
                Advanced Academia
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Not just for high school. <br className="hidden md:block"/>Built for rigorous research.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Studylite supports advanced college curriculums and post-graduate studies. Connect with verified academic researchers, access dissertations, and collaborate on high-level academic projects.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p className="ml-3 text-slate-700">Peer-reviewed study guides and college papers.</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p className="ml-3 text-slate-700">Direct consultations with verified academic researchers.</p>
                </li>
              </ul>

              <Link href="/research" className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center transition-colors">
                Explore our research network
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </Link>
            </div>

            <div className="lg:w-1/2 w-full">
              {/* Stylized visual representation of research documents */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-blue-50 rounded-3xl transform rotate-3 scale-105"></div>
                <div className="absolute inset-0 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col p-8 overflow-hidden">
                  <div className="w-full h-8 bg-slate-100 rounded-md mb-6"></div>
                  <div className="w-3/4 h-4 bg-slate-100 rounded-md mb-3"></div>
                  <div className="w-5/6 h-4 bg-slate-100 rounded-md mb-8"></div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <div className="h-24 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center flex-col">
                      <span className="text-2xl font-black text-indigo-600">10k+</span>
                      <span className="text-xs text-indigo-400 font-medium uppercase mt-1">Papers</span>
                    </div>
                    <div className="h-24 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center flex-col">
                      <span className="text-2xl font-black text-blue-600">500+</span>
                      <span className="text-xs text-blue-400 font-medium uppercase mt-1">Researchers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CTA FOR EDUCATORS / RESEARCHERS */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5 text-white tracking-tight">
            Monetize your academic expertise.
          </h2>
          <p className="text-lg mb-10 text-slate-300 leading-relaxed">
            Are you a teacher, researcher, or top-tier student? Publish your notes, set your own prices, and offer tutoring services to students globally.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/register?role=educator" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Apply to Teach & Sell
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  );
}
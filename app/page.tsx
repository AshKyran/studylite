import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. HERO SECTION: Ultra-Premium Dark Theme */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Advanced Ambient Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* Subtle tech/academic grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-md text-slate-300 font-medium text-xs sm:text-sm mb-8 shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-3 animate-pulse"></span>
            The Global Nexus for Academic Excellence
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1] max-w-5xl">
            Where intellect meets <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              limitless opportunity.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light">
            A unified ecosystem gathering ambitious learners, elite educators, and pioneering researchers. From foundational high school concepts to peer-reviewed academic publications and practical capstone projects.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 text-lg flex items-center justify-center"
            >
              Enter the Ecosystem
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-slate-300 border border-slate-700 font-bold rounded-2xl hover:bg-slate-800 hover:text-white transition-all duration-300 text-lg flex items-center justify-center"
            >
              Explore Research & Notes
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE THREE PILLARS (Who Gathers Here) */}
      <section className="py-24 bg-white relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">A Multi-Sided Architecture</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Studylite is not just a study tool. It is a collaborative economy built for every stage of the academic journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* The Learner */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white border border-slate-200 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The Learner</h3>
              <p className="text-slate-600 leading-relaxed">
                From high school fundamentals to university degrees. Access verified materials, book expert tutors, and take rigorous online assessments to guarantee your success.
              </p>
            </div>

            {/* The Educator */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white border border-slate-200 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The Educator</h3>
              <p className="text-slate-600 leading-relaxed">
                Monetize your expertise. Publish study guides, host 1-on-1 mentorship sessions, and build a digital revenue stream while shaping the next generation of professionals.
              </p>
            </div>

            {/* The Researcher */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The Researcher</h3>
              <p className="text-slate-600 leading-relaxed">
                A hub for advanced academia. Publish peer-reviewed papers, collaborate on dissertations, and access high-level academic data to further your post-graduate work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CAPABILITIES (Bento Grid) */}
      <section className="py-24 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">A complete academic operating system.</h2>
            <p className="text-xl text-slate-600 max-w-3xl">Everything you need to research, learn, test, and build, entirely integrated into one seamless platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature: Notes & Papers */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Marketplace & Library</h3>
              <p className="text-slate-600">Buy, sell, and access a vast repository of high school revision guides, university curriculums, and advanced research papers.</p>
            </div>

            {/* Feature: Tutors */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Experts & Tutors</h3>
              <p className="text-slate-600">Book 1-on-1 virtual or local sessions with rigorously vetted academic professionals, professors, and top-tier students.</p>
            </div>

            {/* Feature: Online Tests */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Online Assessments</h3>
              <p className="text-slate-600">Test your knowledge with timed revision exams, dynamic multiple-choice quizzes, and automated grading systems.</p>
            </div>

            {/* Feature: NEW - Projects & Capstones (Spans 2 columns on large screens) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 md:col-span-2 lg:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Projects, Capstones & Final Tests</h3>
              <p className="text-slate-600 max-w-xl relative z-10">
                Go beyond theory. Collaborate on final year projects, submit complex coding or research assignments, and participate in practical assessments graded by verified industry professionals and academics.
              </p>
            </div>

            {/* Feature: Community Q&A */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community Q&A</h3>
              <p className="text-slate-600">Stuck on a complex theorem or research query? Get detailed, peer-reviewed answers from subject matter experts globally.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FINAL CTA: Join the Nexus */}
      <section className="bg-slate-950 py-24 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 text-white tracking-tight">
            Ready to elevate your intellect?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            Whether you are here to master a high school curriculum, publish groundbreaking research, or evaluate final-year projects, your platform awaits.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all duration-300 text-xl"
            >
              Create Your Free Account
            </Link>
            <Link 
              href="/register?role=educator" 
              className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-slate-700 text-white font-bold rounded-2xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 text-xl"
            >
              Apply as an Educator / Researcher
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  );
}
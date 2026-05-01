import Link from "next/link";

export default function ExamsHubPage() {
  // Mock data for featured or popular exams. 
  // In production, fetch this from prisma.exam.findMany(...)
  const featuredExams = [
    { id: "1", title: "Advanced Quantum Mechanics - Final", subject: "Physics", level: "Post-Grad", duration: "120 mins", questions: 50, type: "Timed Strict" },
    { id: "2", title: "KCSE Mathematics Revision (Paper 1)", subject: "Mathematics", level: "High School", duration: "Untimed", questions: 30, type: "Multiple Choice" },
    { id: "3", title: "Molecular Biology: Cellular Respiration", subject: "Biology", level: "Undergrad", duration: "45 mins", questions: 25, type: "Timed Standard" },
    { id: "4", title: "Data Structures & Algorithms", subject: "Computer Science", level: "Undergrad", duration: "Live", questions: 15, type: "Real-Time Arena" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* 1. HERO SECTION: The Assessment Engine */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Ambient Glow Effects for a "High-Tech/Testing" feel */}
        <div className="absolute top-0 left-1/4 w-full max-w-2xl h-[400px] bg-rose-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-md text-slate-300 font-medium text-xs sm:text-sm mb-6 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 mr-3 animate-pulse"></span>
            The Assessment Engine
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl">
            Evaluate your intellect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">rigorous precision.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
            From quick multiple-choice knowledge checks to strictly timed, real-time academic simulations. Test your readiness before the real thing.
          </p>
        </div>
      </section>

      {/* 2. EXAM MODALITIES (The 4 Types you requested) */}
      <section className="py-20 relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Modality 1: Timed Exams */}
            <Link href="/exams/timed" className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-900/5 transition-all duration-300 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors pointer-events-none -mr-10 -mt-10"></div>
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Timed Simulations</h3>
              <p className="text-slate-600 text-sm leading-relaxed relative z-10 flex-grow">
                Strict countdown timers. Browser lock-down modes. Experience the exact pressure of a final examination.
              </p>
              <span className="text-rose-600 font-bold text-sm mt-4 flex items-center relative z-10">
                Enter Simulation <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>

            {/* Modality 2: Multiple Choice */}
            <Link href="/exams/quizzes" className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors pointer-events-none -mr-10 -mt-10"></div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Choices & Quizzes</h3>
              <p className="text-slate-600 text-sm leading-relaxed relative z-10 flex-grow">
                Rapid-fire multiple choice questions. Instant grading and detailed step-by-step solutions upon completion.
              </p>
              <span className="text-blue-600 font-bold text-sm mt-4 flex items-center relative z-10">
                Start Practicing <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>

            {/* Modality 3: Real-Time Arena */}
            <Link href="/exams/live" className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors pointer-events-none -mr-10 -mt-10"></div>
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Live Assessments</h3>
              <p className="text-slate-600 text-sm leading-relaxed relative z-10 flex-grow">
                Join scheduled, real-time testing sessions supervised by verified educators. Compete on live leaderboards.
              </p>
              <span className="text-amber-600 font-bold text-sm mt-4 flex items-center relative z-10">
                View Schedule <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>

            {/* Modality 4: Custom PDF Generator */}
            <Link href="/exams/generator" className="bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-700 hover:border-emerald-400 hover:shadow-emerald-900/20 transition-all duration-300 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none -mr-10 -mt-10"></div>
              <div className="w-14 h-14 bg-slate-800 text-emerald-400 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">PDF Exam Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10 flex-grow">
                Select subjects, difficulty, and question counts. We instantly compile a printable PDF exam with a separate marking scheme.
              </p>
              <span className="text-emerald-400 font-bold text-sm mt-4 flex items-center relative z-10">
                Generate Paper <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* 3. BROWSE EXISTING EXAMS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Available Assessments</h2>
              <p className="mt-2 text-slate-600">Curated tests from verified educators and institutional past papers.</p>
            </div>
            
            {/* Quick Search */}
            <div className="mt-6 md:mt-0 relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search subjects or exams..."
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Table / List View for Exams */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-5">Exam Title & Subject</th>
                    <th className="p-5">Level</th>
                    <th className="p-5">Format</th>
                    <th className="p-5">Length</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {featuredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5">
                        <p className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{exam.title}</p>
                        <p className="text-sm text-slate-500">{exam.subject}</p>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {exam.level}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center">
                          {/* Dynamically render icon based on type */}
                          {exam.type.includes("Timed") && <svg className="w-4 h-4 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          {exam.type.includes("Choice") && <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                          {exam.type.includes("Live") && <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                          <span className="text-sm font-medium text-slate-700">{exam.type}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-sm font-bold text-slate-900">{exam.questions} Qs</p>
                        <p className="text-xs text-slate-500">{exam.duration}</p>
                      </td>
                      <td className="p-5 text-right">
                        <Link 
                          href={`/exams/take/${exam.id}`}
                          className="inline-flex justify-center items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors shadow-sm text-sm"
                        >
                          Start Test
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination / View All */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 text-center">
              <button className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                View All Assessments &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
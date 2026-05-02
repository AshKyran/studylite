import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function TestsHubPage() {
  // 1. Authentication & Gatekeeper Logic
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirect=/explore/tests");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true }
  });

  // THE STRICT GATEKEEPER: Kick out free and 7-Day Trial users
  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=tests");
  }

  // 2. Fetch Available Exams from the Database
  // Note: This requires an 'Exam' model in your schema.prisma
  const availableExams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      subject: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10, // Fetch the latest 10 for the featured table
  }).catch(() => []); // Fallback empty array just in case the schema isn't pushed yet

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans selection:bg-rose-500 selection:text-white pb-20">
      
      {/* 1. HERO SECTION: The Assessment Engine */}
      <section className="relative pt-24 pb-24 overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Ambient Glow Effects for a "High-Tech/Testing" feel */}
        <div className="absolute top-0 left-1/4 w-full max-w-2xl h-100 bg-rose-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size:[4rem_4rem] [mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md text-slate-300 font-bold text-xs sm:text-sm mb-8 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 mr-3 animate-pulse"></span>
            Premium Assessment Engine
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl">
            Evaluate your intellect with <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-orange-400">rigorous precision.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium">
            From rapid-fire knowledge checks to strictly timed academic simulations. Test your readiness before the real examination.
          </p>
        </div>
      </section>

      {/* 2. EXAM MODALITIES */}
      <section className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Modality 1: Timed Exams */}
          <Link href="/explore/tests/timed" className="bg-white rounded-3xl p-8 shadow-md border border-slate-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-900/10 transition-all duration-300 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors pointer-events-none -mr-10 -mt-10"></div>
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Timed Simulations</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10 grow">
              Strict countdown timers. Browser lock-down modes. Experience the exact pressure of a final examination.
            </p>
            <span className="text-rose-600 font-bold text-sm mt-6 flex items-center relative z-10">
              Enter Simulation <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>

          {/* Modality 2: Multiple Choice */}
          <Link href="/explore/tests/quizzes" className="bg-white rounded-3xl p-8 shadow-md border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors pointer-events-none -mr-10 -mt-10"></div>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Choices & Quizzes</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10 grow">
              Rapid-fire multiple choice questions. Instant grading and detailed step-by-step solutions upon completion.
            </p>
            <span className="text-blue-600 font-bold text-sm mt-6 flex items-center relative z-10">
              Start Practicing <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>

          {/* Modality 3: Real-Time Arena */}
          <Link href="/explore/tests/live" className="bg-white rounded-3xl p-8 shadow-md border border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors pointer-events-none -mr-10 -mt-10"></div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Live Assessments</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10 grow">
              Join scheduled, real-time testing sessions supervised by verified educators. Compete on live leaderboards.
            </p>
            <span className="text-amber-600 font-bold text-sm mt-6 flex items-center relative z-10">
              View Schedule <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>

          {/* Modality 4: Custom PDF Generator */}
          <Link href="/explore/tests/generator" className="bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-700 hover:border-emerald-400 hover:shadow-emerald-900/30 transition-all duration-300 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none -mr-10 -mt-10"></div>
            <div className="w-14 h-14 bg-slate-800 text-emerald-400 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">PDF Exam Generator</h3>
            <p className="text-slate-400 text-sm leading-relaxed relative z-10 grow">
              Select subjects, difficulty, and questions. We instantly compile a printable PDF exam with a separate marking scheme.
            </p>
            <span className="text-emerald-400 font-bold text-sm mt-6 flex items-center relative z-10">
              Generate Paper <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>

        </div>
      </section>

      {/* 3. BROWSE EXISTING EXAMS */}
      <section className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Available Assessments</h2>
            <p className="mt-2 text-slate-600 font-medium">Curated tests from verified educators and institutional past papers.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search subjects or exams..."
              className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {availableExams.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 border-dashed text-center">
            <span className="text-4xl mb-4 block">📝</span>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Exams Available</h3>
            <p className="text-slate-500">Educators are currently preparing the assessment database.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">Exam Title & Subject</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {availableExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{exam.title}</p>
                        <p className="text-sm text-slate-500">{exam.subject?.name || "General Subject"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {exam.level.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-slate-700">{exam.type || "Standard Quiz"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{exam.questionsCount || 0} Qs</p>
                        <p className="text-xs text-slate-500 font-medium">{exam.duration ? `${exam.duration} mins` : "Untimed"}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link 
                          href={`/explore/tests/take/${exam.id}`}
                          className="inline-flex justify-center items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors shadow-sm text-sm"
                        >
                          Start Test
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-50/50 border-t border-slate-200 p-4 text-center">
              <button className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Load More Assessments &rarr;
              </button>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
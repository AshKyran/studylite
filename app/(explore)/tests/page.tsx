// app/(explore)/tests/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BrainCircuit, 
  Clock, 
  FileQuestion, 
  PlayCircle, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TestsHubPage() {
  // 1. Strict Authentication & Error Handling
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
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

  // 2. Fetch Available Exams securely
  const availableExams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      subject: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 12, 
  }).catch(() => []); // Fallback empty array just in case the schema isn't fully synced

  return (
    <div className="p-4 sm:p-6 md:p-10 pb-24 max-w-7xl mx-auto space-y-10">
      
      {/* Assessment Engine Header */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 shrink-0" />
              Assessment Engine
            </h1>
            <p className="text-lg text-slate-300 font-medium mb-6">
              Test your knowledge, identify weak points, and prepare for finals with our adaptive testing environment.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/explore/tests/generator" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                AI Test Generator <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/explore/tests/results" 
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                My Past Results
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tests Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">Featured Assessments</h2>
        </div>

        {availableExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExams.map((exam) => (
              <div 
                key={exam.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col overflow-hidden group"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-md mb-3">
                      {exam.subject.name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {exam.title}
                    </h3>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <FileQuestion className="w-4 h-4 text-slate-400" />
                      {exam.questionsCount || 0} Questions
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {exam.duration ? `${exam.duration} mins` : "Untimed"}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <Link 
                      href={`/explore/tests/take/${exam.id}`}
                      className="w-full flex justify-center items-center gap-2 px-4 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      <PlayCircle className="w-5 h-5" /> Start Assessment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No assessments available</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
              Our tutors are currently building new exams. You can generate your own custom test using the AI generator.
            </p>
            <Link 
              href="/explore/tests/generator" 
              className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Go to AI Generator
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}
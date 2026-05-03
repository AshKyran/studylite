// app/(explore)/tests/results/[attemptId]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { 
  Award, 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  ArrowLeft 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResultsPage(props: { params: Promise<{ attemptId: string }> }) {
  // UPGRADE: Await params for Next.js 15
  const resolvedParams = await props.params;
  const attemptId = resolvedParams.attemptId;

  // 1. Strict Authentication & Error Handling
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  // 2. Fetch the Attempt AND the full Exam Marking Scheme
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          subject: true,
          questions: {
            include: { options: true } // Fetches the correct answers
          }
        }
      }
    }
  });

  if (!attempt) notFound();

  // SECURITY: Only the student who took the test can view these results
  if (attempt.userId !== authUser.id) {
    redirect("/explore/tests?error=unauthorized_result");
  }

  // 3. Calculate Grade Metrics
  const percentage = Math.round((attempt.score / attempt.maxScore) * 100);
  
  let gradeColor = "text-emerald-500";
  let bgGlow = "shadow-[0_0_40px_rgba(16,185,129,0.2)]";
  let feedbackMessage = "Excellent work! You have a solid grasp of this material.";
  let GradeIcon = Award;
  
  if (percentage < 50) {
    gradeColor = "text-rose-500";
    bgGlow = "shadow-[0_0_40px_rgba(244,63,94,0.2)]";
    feedbackMessage = "Needs review. We recommend revisiting the core concepts before retaking.";
    GradeIcon = AlertCircle;
  } else if (percentage < 75) {
    gradeColor = "text-amber-500";
    bgGlow = "shadow-[0_0_40px_rgba(245,158,11,0.2)]";
    feedbackMessage = "Good effort! Review the explanations below to perfect your score.";
    GradeIcon = BookOpen;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 selection:text-indigo-900 pb-24">
      
      {/* Dynamic Header based on Score */}
      <header className="bg-slate-900 border-b border-slate-800 pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-800 border border-slate-700 mb-6 shadow-sm">
            <GradeIcon className={`w-12 h-12 ${gradeColor}`} />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4">
            {attempt.score} <span className="text-2xl sm:text-4xl text-slate-500">/ {attempt.maxScore}</span>
          </h1>
          
          <div className={`inline-block px-6 py-2 rounded-full font-black text-xl mb-6 bg-slate-950 border border-slate-800 ${gradeColor} ${bgGlow}`}>
            {percentage}% Score
          </div>
          
          <p className="text-lg text-slate-400 font-medium max-w-lg mx-auto">
            {feedbackMessage}
          </p>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-8">
        
        {/* Info Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{attempt.exam.title}</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              {attempt.exam.subject.name} • Marking Scheme
            </p>
          </div>
          <Link 
            href={`/explore/tests/take/${attempt.examId}`}
            className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors w-full sm:w-auto text-center"
          >
            Retake Assessment
          </Link>
        </div>

        {/* Detailed Marking Scheme */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
            Detailed Review
          </h3>
          
          <div className="space-y-8">
            {attempt.exam.questions.map((question, index) => (
              <div key={question.id} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                
                {/* Question Header */}
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-slate-900 leading-relaxed pr-4">
                    <span className="text-slate-400 mr-2">{index + 1}.</span>
                    {question.text}
                  </h3>
                  <span className="shrink-0 text-xs font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">
                    {question.marks} pts
                  </span>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {question.options.map((option) => {
                    const isCorrect = option.isCorrect;
                    return (
                      <div 
                        key={option.id}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all ${
                          isCorrect 
                            ? "border-emerald-500 bg-emerald-50/50" 
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <div className={`shrink-0 mr-4 ${isCorrect ? "text-emerald-500" : "text-slate-300"}`}>
                          {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                        </div>
                        <span className={`text-base font-medium ${isCorrect ? "text-emerald-900" : "text-slate-600"}`}>
                          {option.text}
                        </span>
                        
                        {/* Correct Answer Badge */}
                        {isCorrect && (
                          <span className="ml-auto text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-md">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tutor Explanation (If provided) */}
                {question.explanation && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-2xl mt-6 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-1.5">Tutor Explanation</h4>
                      <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
            ))}
          </div>

        </div>

        {/* Back Navigation */}
        <div className="text-center pt-8">
          <Link 
            href="/explore/tests"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Assessment Hub
          </Link>
        </div>
      </main>

    </div>
  );
}
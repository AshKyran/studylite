import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function ResultsPage({
  params,
}: {
  params: { attemptId: string };
}) {
  // 1. Strict Authentication
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // 2. Fetch the Attempt AND the full Exam Marking Scheme
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: params.attemptId },
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
    redirect("/dashboard?error=unauthorized_result");
  }

  // 3. Calculate Grade Metrics
  const percentage = Math.round((attempt.score / attempt.maxScore) * 100);
  
  let gradeColor = "text-emerald-500";
  let bgGlow = "shadow-[0_0_40px_rgba(16,185,129,0.2)]";
  let feedbackMessage = "Excellent work! You have a solid grasp of this material.";
  
  if (percentage < 50) {
    gradeColor = "text-rose-500";
    bgGlow = "shadow-[0_0_40px_rgba(225,29,72,0.2)]";
    feedbackMessage = "Needs improvement. Review the marking scheme below carefully.";
  } else if (percentage < 75) {
    gradeColor = "text-amber-500";
    bgGlow = "shadow-[0_0_40px_rgba(245,158,11,0.2)]";
    feedbackMessage = "Good job! A little more review and you'll master this.";
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* HEADER: Score Overview */}
      <header className="bg-slate-950 pt-20 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-4">
            Assessment Complete
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
            {attempt.exam.title}
          </h1>
          <p className="text-slate-400 font-medium mb-12">
            {attempt.exam.subject.name} • Completed on {new Date(attempt.completedAt).toLocaleDateString()}
          </p>

          {/* Big Score Circle */}
          <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full bg-slate-900 border-8 border-slate-800 flex flex-col items-center justify-center mb-6 ${bgGlow} transition-shadow duration-700`}>
            <span className={`text-5xl md:text-7xl font-black ${gradeColor}`}>
              {percentage}%
            </span>
            <span className="text-slate-400 font-bold mt-2">
              {attempt.score} / {attempt.maxScore} Marks
            </span>
          </div>

          <p className="text-lg text-slate-300 font-medium max-w-lg">
            {feedbackMessage}
          </p>
        </div>
      </header>

      {/* BODY: Marking Scheme Review */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 mb-8">
          
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
            <svg className="w-6 h-6 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Official Answer Key & Review
          </h2>

          <div className="space-y-10">
            {attempt.exam.questions.map((question, qIndex) => (
              <div key={question.id} className="border-b border-slate-100 pb-10 last:border-0 last:pb-0">
                
                {/* Question Details */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Question {qIndex + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {question.marks} Marks
                  </span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-6 leading-relaxed">
                  {question.text}
                </h3>

                {/* Options List */}
                <div className="space-y-3 mb-6 pl-0 sm:pl-4">
                  {question.options.map((option, oIndex) => {
                    const labels = ["A", "B", "C", "D", "E"];
                    return (
                      <div 
                        key={option.id}
                        className={`flex items-center p-4 rounded-xl border-2 transition-colors ${
                          option.isCorrect 
                            ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                            : "bg-white border-slate-100 text-slate-400"
                        }`}
                      >
                        <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 ${
                          option.isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {labels[oIndex]}
                        </span>
                        <span className={`text-base font-medium ${option.isCorrect ? "text-emerald-900" : "text-slate-500"}`}>
                          {option.text}
                        </span>
                        
                        {/* Correct Answer Badge */}
                        {option.isCorrect && (
                          <span className="ml-auto text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded">Correct</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tutor Explanation (If provided) */}
                {question.explanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl mt-4">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Tutor Explanation</h4>
                    <p className="text-sm text-blue-900 font-medium leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}
                
              </div>
            ))}
          </div>

        </div>

        {/* Back Navigation */}
        <div className="text-center">
          <Link 
            href="/explore/tests"
            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
          >
            &larr; Back to Assessment Hub
          </Link>
        </div>
      </main>

    </div>
  );
}
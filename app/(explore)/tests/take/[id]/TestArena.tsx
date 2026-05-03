// app/(explore)/tests/take/[id]/TestArena.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitTestAttempt } from "./actions"; 
import { toast } from "sonner";
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Save, 
  AlertCircle
} from "lucide-react";

// --- TYPES ---
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  marks: number;
  options: Option[];
}

interface SanitizedExam {
  id: string;
  title: string;
  duration: number | null;
  subject: { name: string };
  questions: Question[];
}

interface TestArenaProps {
  exam: SanitizedExam;
  userId: string;
  previousAttempts: number;
}

export default function TestArena({ exam, userId, previousAttempts }: TestArenaProps) {
  const router = useRouter();

  // --- STATE ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  const [timeLeft, setTimeLeft] = useState<number | null>(
    exam.duration ? exam.duration * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. SAFE STATE REF: Ensures the auto-submit timer always grabs the latest answers 
  // without triggering constant re-renders or stale closures.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const hasSubmittedRef = useRef(false);

  // --- SUBMISSION LOGIC ---
  const submitAnswers = useCallback(async (isAutoSubmit: boolean = false) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    const toastId = toast.loading(isAutoSubmit ? "Time's up! Auto-submitting..." : "Submitting assessment...");

    try {
      const payload = {
        examId: exam.id,
        answers: answersRef.current,
      };

      const result = await submitTestAttempt(payload);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setIsSubmitting(false);
        hasSubmittedRef.current = false;
      } else {
        toast.success("Assessment submitted successfully!", { id: toastId });
        router.push(`/explore/tests/results/${result.attemptId}`);
      }
    } catch (err) {
      toast.error("A critical error occurred. Please refresh.", { id: toastId });
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
    }
  }, [exam.id, router]);

  // --- TIMER LOGIC ---
  useEffect(() => {
  if (exam.duration === null) return;

  const timer = window.setInterval(() => {
    setTimeLeft((prev) => {
      // 1. Check if we've hit the end
      if (prev !== null && prev <= 1) {
        window.clearInterval(timer);
        
        // 2. Schedule the submission for the next tick
        setTimeout(() => {
          submitAnswers(true);
        }, 0);
        
        return 0;
      }
      // 3. Just tick down
      return prev !== null ? prev - 1 : null;
    });
  }, 1000);

  // Cleanup: clear the interval if the user navigates away or component unmounts
  return () => window.clearInterval(timer);
}, [exam.duration, submitAnswers]); 

  // --- HANDLERS ---
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const navigateQuestion = (direction: "next" | "prev") => {
    if (direction === "next" && currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentQuestion = exam.questions[currentIndex];
  const isLastQuestion = currentIndex === exam.questions.length - 1;
  const isTimeLow = timeLeft !== null && timeLeft < 300; // Under 5 minutes

  return (
    <div className="flex flex-col min-h-screen text-slate-300">
      
      {/* HEADER: Always pinned to top */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black text-white leading-tight truncate max-w-50 sm:max-w-md">
            {exam.title}
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            {exam.subject.name} • {previousAttempts > 0 ? `Attempt #${previousAttempts + 1}` : "First Attempt"}
          </p>
        </div>

        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-colors ${
            isTimeLow ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse" : "bg-slate-800 text-indigo-400 border border-slate-700"
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </header>

      {/* MAIN STAGE */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col justify-center">
        
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-400">
              Question {currentIndex + 1} of {exam.questions.length}
            </span>
            <span className="text-xs font-black bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {currentQuestion.marks} {currentQuestion.marks === 1 ? "Point" : "Points"}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / exam.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative">
          <h2 className="text-xl sm:text-2xl font-medium text-white mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                  disabled={isSubmitting}
                  className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all group ${
                    isSelected 
                      ? "border-indigo-500 bg-indigo-500/10" 
                      : "border-slate-800 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <div className={`shrink-0 mr-4 transition-colors ${isSelected ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"}`}>
                    {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <span className={`text-base sm:text-lg font-medium transition-colors ${isSelected ? "text-indigo-50" : "text-slate-300 group-hover:text-white"}`}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </main>

      {/* FOOTER CONTROLS */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 sm:p-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          
          <button
            onClick={() => navigateQuestion("prev")}
            disabled={currentIndex === 0 || isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            &larr; Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => navigateQuestion("next")}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-slate-900 bg-indigo-400 hover:bg-indigo-300 transition-all active:scale-95"
            >
              Next Question <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3 rounded-xl font-black text-slate-900 bg-emerald-500 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {isSubmitting ? "Processing..." : <><Save className="w-5 h-5" /> Submit Assessment</>}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitTestAttempt } from "./actions"; 

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
  const [error, setError] = useState("");

  // 1. SAFE STATE REF: Ensures the auto-submit timer always grabs the latest answers 
  // without triggering constant re-renders or stale closures.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Prevent accidental double-submissions
  const hasSubmittedRef = useRef(false);

  const currentQuestion = exam.questions[currentIndex];
  const isLastQuestion = currentIndex === exam.questions.length - 1;
  const progressPercentage = ((currentIndex + 1) / exam.questions.length) * 100;

  // --- SUBMISSION LOGIC (Moved UP to fix Error 1) ---
  const submitAnswers = useCallback(async (isAutoSubmit = false) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    setIsSubmitting(true);
    
    if (isAutoSubmit) {
      setError("Time is up! Submitting your answers automatically...");
    } else {
      setError("");
    }

    try {
      // Pass the ref current state to ensure perfect accuracy
      const result = await submitTestAttempt({ examId: exam.id, answers: answersRef.current });
      
      if (result.success) {
        router.push(`/explore/tests/results/${result.attemptId}`);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
    }
  }, [exam.id, router]);


  // --- TIMER LOGIC (Patched to fix Error 2) ---
  useEffect(() => {
    if (timeLeft === null) return; // Untimed exam

    if (timeLeft <= 0) {
      // Placing this inside a setTimeout of 0 pushes it to the next JS event loop tick.
      // This perfectly satisfies React's rule against synchronous state updates inside useEffect!
      const timeoutId = setTimeout(() => {
        submitAnswers(true);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitAnswers]);


  // --- INTERACTION HANDLERS ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const navigateQuestion = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) setCurrentIndex((c) => c - 1);
    if (direction === "next" && !isLastQuestion) setCurrentIndex((c) => c + 1);
  };


  // --- UI RENDERING ---
  return (
    <div className="flex flex-col min-h-screen text-slate-100">
      
      {/* 1. ARENA HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white line-clamp-1">{exam.title}</h1>
            <p className="text-sm font-medium text-slate-400">{exam.subject.name} • {exam.questions.length} Questions</p>
          </div>

          {/* Dynamic Timer Badge */}
          {timeLeft !== null && (
            <div className={`flex items-center px-4 py-2 rounded-xl font-mono text-xl font-bold tracking-wider transition-colors ${
              timeLeft < 60 ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/50" : "bg-slate-800 text-slate-300"
            }`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div 
            className="bg-emerald-500 h-1.5 transition-all duration-300 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* 2. MAIN QUESTION AREA */}
      <main className="grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl">
          
          <div className="flex justify-between items-end mb-8">
            <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm">
              Question {currentIndex + 1} of {exam.questions.length}
            </span>
            <span className="text-slate-500 font-medium text-sm">
              {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-medium leading-relaxed mb-10 text-white">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const labels = ["A", "B", "C", "D", "E"];
              
              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.id)}
                  className={`w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? "bg-emerald-900/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                      : "bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50"
                  }`}
                >
                  <span className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mr-5 transition-colors ${
                    isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}>
                    {labels[idx]}
                  </span>
                  <span className={`text-lg sm:text-xl font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </main>

      {/* 3. NAVIGATION FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <button
            onClick={() => navigateQuestion("prev")}
            disabled={currentIndex === 0 || isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>

          {error && <div className="text-red-400 font-medium text-sm text-center">{error}</div>}

          {!isLastQuestion ? (
            <button
              onClick={() => navigateQuestion("next")}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-900 bg-slate-100 hover:bg-white transition-colors shadow-lg"
            >
              Next Question &rarr;
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-3 rounded-xl font-black text-slate-900 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Grading...
                </span>
              ) : (
                "Submit Assessment"
              )}
            </button>
          )}

        </div>
      </footer>

    </div>
  );
}
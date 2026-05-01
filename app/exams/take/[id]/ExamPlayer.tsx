"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  text: string;
  options: string[];
};

type ExamPlayerProps = {
  exam: {
    id: string;
    title: string;
    durationMinutes: number;
    questions: Question[];
  };
};

export default function ExamPlayer({ exam }: ExamPlayerProps) {
  const router = useRouter();
  
  // 1. State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = exam.questions[currentIndex];
  const isLastQuestion = currentIndex === exam.questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // 2. Define functions securely using useCallback to prevent Next.js linting errors
  const processSubmission = useCallback(async () => {
    setIsSubmitting(true);
    // In production: send `answers` to /api/exams/submit for grading
    await new Promise((res) => setTimeout(res, 1500)); 
    router.push(`/exams/results/${exam.id}`); // Redirect to a results page
  }, [exam.id, router]);

  const handleAutoSubmit = useCallback(async () => {
    alert("Time is up! Submitting your exam automatically.");
    await processSubmission();
  }, [processSubmission]);

  const handleSubmit = async () => {
    const confirmSubmit = window.confirm("Are you sure you want to submit your exam?");
    if (!confirmSubmit) return;
    
    await processSubmission();
  };

  const handleSelectOption = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  // Format time (e.g., 45:00)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };


  useEffect(() => {
    if (timeLeft <= 0) {
      const autoSubmitTimer = setTimeout(() => {
        handleAutoSubmit();
      }, 0);
      return () => clearTimeout(autoSubmitTimer);
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleAutoSubmit]);

  // 4. Render the Full UI
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-rose-200 selection:text-rose-900">
      
      {/* TOP NAVIGATION / TIMER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 truncate pr-4">
            <button 
              onClick={() => router.push("/exams")}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Exit Exam"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {exam.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 shrink-0">
            {/* Timer Widget */}
            <div className={`flex items-center px-4 py-1.5 rounded-full font-bold text-sm sm:text-base border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timeLeft)}
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="hidden sm:inline-flex items-center px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="grow max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        
        {/* Sidebar: Question Navigator */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 sm:p-6 overflow-x-auto md:overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 hidden md:block">Question Map</h2>
          <div className="flex md:grid md:grid-cols-4 gap-2 min-w-max md:min-w-0 pb-2 md:pb-0">
            {exam.questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isActive = currentIndex === index;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-10 h-10 shrink-0 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                    isActive 
                      ? "ring-2 ring-rose-500 ring-offset-2 bg-rose-600 text-white" 
                      : isAnswered
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-rose-300 hover:text-rose-600"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Area */}
        <div className="grow p-4 sm:p-8 md:p-12 bg-white flex flex-col">
          <div className="max-w-3xl mx-auto w-full grow flex flex-col">
            
            {/* Question Header */}
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg mb-4">
                Question {currentIndex + 1} of {exam.questions.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4 grow">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                
                return (
                  <label 
                    key={idx}
                    className={`flex items-start p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? "border-rose-500 bg-rose-50 shadow-sm" 
                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center h-6">
                      <input 
                        type="radio" 
                        name={currentQuestion.id}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleSelectOption(option)}
                        className="w-5 h-5 text-rose-600 border-slate-300 focus:ring-rose-500"
                      />
                    </div>
                    <div className="ml-4 grow">
                      <span className={`text-base sm:text-lg ${isSelected ? "text-rose-900 font-semibold" : "text-slate-700 font-medium"}`}>
                        {option}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Controls (Next/Prev) */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={isFirstQuestion}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Previous
              </button>
              
              {!isLastQuestion ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Next Question &rarr;
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-md shadow-rose-600/20"
                >
                  {isSubmitting ? "Submitting..." : "Submit Final Exam"}
                </button>
              )}
            </div>

          </div>
        </div>

      </main>
      
      {/* Mobile Submit Button */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-200 z-50">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-slate-900 text-white text-base font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>

    </div>
  );
}
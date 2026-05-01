"use client";

import { useState } from "react";
import Link from "next/link";

export default function ExamGeneratorPage() {
  // Form State
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);
  
  // Submission State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !level) {
      setError("Please select both a subject and an education level.");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      // In production, this will hit your /api/generate-pdf route
      // which will use a library like 'jspdf' or '@react-pdf/renderer'
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Mock API delay
      
      // Mock successful download trigger
      alert("PDF Generated Successfully! (Download will start in production)");
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16 lg:py-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Header */}
        <div className="mb-8 sm:mb-12">
          <Link 
            href="/exams" 
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Assessment Hub
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Custom PDF Generator
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
            Configure your parameters below. Our engine will pull random questions from verified past papers and tutor materials to create a unique, printable exam.
          </p>
        </div>

        {/* Main Interface: Stacks on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-2">
            <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="space-y-6 sm:space-y-8">
                
                {/* Subject & Level Grid: 1 col on mobile, 2 on tablet+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2" htmlFor="subject">
                      Subject
                    </label>
                    <select 
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow appearance-none"
                    >
                      <option value="">Select a subject...</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="physics">Physics</option>
                      <option value="biology">Biology</option>
                      <option value="computer_science">Computer Science</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2" htmlFor="level">
                      Education Level
                    </label>
                    <select 
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow appearance-none"
                    >
                      <option value="">Select a level...</option>
                      <option value="HIGH_SCHOOL">High School (KCSE/IGCSE)</option>
                      <option value="COLLEGE">Undergraduate</option>
                      <option value="GENERAL">General/Professional</option>
                    </select>
                  </div>
                </div>

                {/* Number of Questions Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-900">
                      Number of Questions
                    </label>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                      {questionCount} Questions
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>10 (Quick Test)</span>
                    <span>100 (Full Mock Exam)</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="pr-4">
                      <span className="block text-sm font-bold text-slate-900 mb-1">Include Marking Scheme</span>
                      <span className="block text-sm text-slate-500">Append detailed answers and step-by-step solutions at the end of the PDF.</span>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={includeMarkingScheme}
                        onChange={(e) => setIncludeMarkingScheme(e.target.checked)}
                      />
                      <span className="pointer-events-none absolute mx-auto h-4 w-9 rounded-full bg-slate-200 transition-colors duration-200 ease-in-out peer-checked:bg-emerald-500"></span>
                      <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-slate-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:border-emerald-500"></span>
                    </div>
                  </label>
                </div>

              </div>
            </form>
          </div>

          {/* Right Column: Summary & Action */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6">Generation Summary</h3>
              
              <ul className="space-y-4 mb-8">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Subject</span>
                  <span className="font-bold text-white capitalize">{subject || "—"}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Level</span>
                  <span className="font-bold text-white capitalize">{level.replace("_", " ") || "—"}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Questions</span>
                  <span className="font-bold text-white">{questionCount}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Marking Scheme</span>
                  <span className="font-bold text-white">{includeMarkingScheme ? "Included" : "Excluded"}</span>
                </li>
              </ul>

              {error && (
                <div className="mb-6 p-3 text-sm text-red-200 bg-red-900/50 rounded-lg border border-red-800/50">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isGenerating ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Compiling PDF...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Generate & Download
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
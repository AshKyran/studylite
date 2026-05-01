"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResearchReaderPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock Data for the research paper/module
  const paper = {
    title: "The Mechanics of Quantum Entanglement in Neural Networks",
    author: {
      name: "Dr. Sarah Chen",
      role: "Senior AI Researcher, MIT",
      avatar: "SC",
    },
    sections: [
      { id: "abstract", title: "1. Abstract" },
      { id: "intro", title: "2. Introduction to State Vectors" },
      { id: "methodology", title: "3. Methodology & Framework" },
      { id: "results", title: "4. Experimental Results" },
      { id: "conclusion", title: "5. Conclusion" },
    ]
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] bg-slate-50 font-sans">
      
      {/* Mobile Header for Toggling Sidebar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <span className="font-bold text-sm text-slate-900 truncate pr-4">Table of Contents</span>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Left Sidebar: Table of Contents */}
      <aside 
        className={`${
          isSidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-72 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] overflow-y-auto`}
      >
        <div className="p-6">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
            Document Outline
          </h3>
          <nav className="flex flex-col gap-1">
            {paper.sections.map((section, idx) => (
              <a 
                key={section.id}
                href={`#${section.id}`}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  idx === 0 
                    ? "bg-blue-50 text-blue-700 font-semibold" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="grow flex justify-center p-4 sm:p-8 lg:p-12">
        <article className="w-full max-w-3xl bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
          
          {/* Article Header */}
          <header className="mb-10 pb-10 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Computer Science</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Peer Reviewed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              {paper.title}
            </h1>
            
            {/* Author Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">{paper.author.avatar}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{paper.author.name}</h4>
                  <p className="text-sm text-slate-500">{paper.author.role}</p>
                </div>
              </div>
              <Link 
                href="/tutors" 
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Book for Tutoring
              </Link>
            </div>
          </header>

          {/* Dummy Article Content */}
          <div className="prose prose-slate prose-blue max-w-none prose-headings:font-bold prose-p:leading-relaxed text-slate-700">
            <h2 id="abstract" className="text-2xl font-bold text-slate-900 mb-4 mt-8">1. Abstract</h2>
            <p className="mb-6">
              The intersection of quantum computing mechanics and deep neural networks represents a frontier in machine learning. In this paper, we explore how mapping network weights to state vectors can reduce computational overhead during backpropagation by a factor of $O(\log n)$.
            </p>

            <h2 id="intro" className="text-2xl font-bold text-slate-900 mb-4 mt-8">2. Introduction to State Vectors</h2>
            <p className="mb-6">
              Traditional neural networks rely on classical bits. By shifting our paradigm to qubits, we allow for states of superposition during the training phase. As noted in previous literature [1], this requires a fundamental restructuring of the loss function.
            </p>
            <div className="my-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
              <p className="text-sm font-medium text-blue-900 italic m-0">
                &#34;The primary bottleneck in large language models is not the dataset size, but the matrix multiplication limits of classical silicon&#34; — Dr. Sarah Chen
              </p>
            </div>

            <h2 id="methodology" className="text-2xl font-bold text-slate-900 mb-4 mt-8">3. Methodology & Framework</h2>
            <p className="mb-6">
              We utilized a 16-qubit simulated environment running in parallel with a standard PyTorch tensor infrastructure. The alignment of these two systems was managed by a custom middleware layer...
            </p>
            {/* End Dummy Content */}
          </div>
          
        </article>
      </main>

    </div>
  );
}
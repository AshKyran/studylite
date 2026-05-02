"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuestion } from "../actions";
import Link from "next/link";

export default function AskQuestionPage() {
  const router = useRouter();

  // Strict state typing
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Basic client-side validation
    if (!title.trim() || !body.trim()) {
      setErrorMessage("Please fill out both the title and the details of your question.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the strict Server Action
      const result = await createQuestion({
        title: title.trim(),
        body: body.trim(),
        // Note: We are leaving subjectId null for now to keep the form simple and bulletproof.
      });

      if (result.success && result.questionId) {
        // Redirect the user directly to their newly created question page
        router.push(`/community/${result.questionId}`);
      }
    } catch (error: unknown) {
      // Safely handle strictly-typed unknown errors
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred while posting your question.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Back Button */}
        <Link 
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Community
        </Link>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ask a Question</h1>
            <p className="text-slate-500 font-medium mt-2">
              Get help from top tutors and peers. Be as specific as possible.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                Question Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How do I calculate the derivative of a composite function?"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
                required
                maxLength={150}
              />
              <p className="text-xs text-slate-400 font-medium mt-2">
                Keep it concise. You can add more details below.
              </p>
            </div>

            {/* Body Input */}
            <div>
              <label htmlFor="body" className="block text-sm font-bold text-slate-700 mb-2">
                Details & Context
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Include any formulas, concepts, or specific areas where you are stuck..."
                rows={6}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400 resize-y"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !body.trim()}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm rounded-xl transition-all shadow-md disabled:shadow-none flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Posting...
                  </>
                ) : (
                  "Post Question"
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
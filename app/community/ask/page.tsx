// app/community/ask/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuestion } from "../actions";
import { toast } from "sonner";
import { 
  MessageSquarePlus, 
  HelpCircle, 
  AlignLeft, 
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function AskQuestionPage() {
  const router = useRouter();

  // Strict state typing
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic client-side validation
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill out both the title and the details of your question.");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Posting your question to the community...");

    try {
      // Call the strict Server Action
      const result = await createQuestion({
        title: title.trim(),
        body: body.trim(),
        // Note: We are leaving subjectId null for now to keep the form bulletproof.
      });

      // UPGRADE: Check for the structured error returned by the server action
      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success && result.questionId) {
        toast.success("Question posted successfully!", { id: toastId });
        // Redirect the user directly to their newly created question page
        router.push(`/community/${result.questionId}`);
      }
    } catch (error: unknown) {
      toast.error("An unexpected network error occurred. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <Link 
        href="/community" 
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Community
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
          <MessageSquarePlus className="w-8 h-8 text-indigo-500" /> Ask a Question
        </h1>
        <p className="text-slate-500 font-medium">
          Get help from our community of top students and verified academic tutors.
        </p>
      </div>

      {/* The Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        {/* Posting Guidelines Card */}
        <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 relative z-10">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">Tips for getting a fast answer:</h4>
            <ul className="text-xs text-blue-800 font-medium space-y-1">
              <li>• Keep the title clear and concise.</li>
              <li>• Include exactly where you are stuck in the details section.</li>
              <li>• Proofread your question before posting.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Title Input */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" /> Question Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., How do I calculate the derivative of e^(2x)?"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-60"
              required
            />
          </div>

          {/* Body Input */}
          <div className="space-y-3">
            <label htmlFor="body" className=" text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" /> Details
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSubmitting}
              rows={8}
              placeholder="Describe your problem, what you have tried, and where you are stuck..."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 resize-y disabled:opacity-60"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] text-base font-black text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {isSubmitting ? "Publishing to Board..." : "Post Question"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
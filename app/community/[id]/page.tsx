// app/community/[id]/page.tsx
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAnswer, acceptAnswer } from "../actions";
import { 
  CheckCircle2, 
  User, 
  ChevronLeft, 
  MessageCircle, 
  Send,
  Award,
  HelpCircle,
  LibraryBig,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function QuestionThreadPage(props: { params: Promise<{ id: string }> }) {
  // 1. Next.js 15 dynamic params standard
  const resolvedParams = await props.params;
  const { id } = resolvedParams;

  // 2. Fetch the Question and all its Answers
  const question = await prisma.communityQuestion.findUnique({
    where: { id },
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
      subject: { select: { name: true } },
      answers: {
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
        orderBy: [
          { isAccepted: "desc" }, // Always put the accepted answer at the top
          { createdAt: "asc" }    // Then sort by oldest first
        ],
      },
    },
  });

  if (!question) notFound();

  // 3. Strict Authenticate user to determine permissions
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  const isQuestionAuthor = authUser?.id === question.authorId;
  const isAuthenticated = !authError && !!authUser;

  // 4. Inline Server Actions (No Client JS needed for basic forms)
  async function handlePostAnswer(formData: FormData) {
    "use server";
    const body = formData.get("body")?.toString();
    if (body && body.trim() !== "") {
       await createAnswer({ questionId: id, body: body.trim() });
    }
  }

  async function handleAcceptAnswer(formData: FormData) {
    "use server";
    const answerId = formData.get("answerId")?.toString();
    if (answerId) {
      await acceptAnswer(id, answerId);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      
      {/* Back Navigation */}
      <Link 
        href="/community" 
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Community Board
      </Link>

      {/* QUESTION MAIN CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        {question.isResolved && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {question.subject && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-100">
              <LibraryBig className="w-4 h-4" /> {question.subject.name}
            </span>
          )}
          <span className="text-sm font-medium text-slate-400">
            Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
          {question.title}
        </h1>

        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
          {question.body}
        </div>

        {/* Author Footer */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {question.author.firstName} {question.author.lastName}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {question.author.role === "TUTOR" ? "Verified Tutor" : "Student"}
            </p>
          </div>
        </div>
      </div>

      {/* ANSWERS SECTION */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-500" />
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>

        {question.answers.map((answer) => (
          <div 
            key={answer.id} 
            className={`rounded-3xl p-6 sm:p-8 border-2 transition-all ${
              answer.isAccepted 
                ? "bg-emerald-50/50 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative" 
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {/* Accepted Answer Badge */}
            {answer.isAccepted && (
              <div className="absolute -top-3 left-8 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Award className="w-3.5 h-3.5" /> Accepted Answer
              </div>
            )}

            <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed mb-6">
              {answer.body}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
              
              {/* Answer Author */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                  answer.author.role === "TUTOR" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {answer.author.firstName[0]}{answer.author.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {answer.author.firstName} {answer.author.lastName}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Accept Action (Only original author can see this) */}
              {isQuestionAuthor && !question.isResolved && !answer.isAccepted && (
                <form action={handleAcceptAnswer}>
                  <input type="hidden" name="answerId" value={answer.id} />
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-100 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Accepted
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* POST NEW ANSWER FORM */}
      {!question.isResolved ? (
        isAuthenticated ? (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <h3 className="text-lg font-black text-white mb-4">Your Answer</h3>
            <form action={handlePostAnswer} className="space-y-4">
              <textarea 
                name="body"
                required
                rows={5}
                placeholder="Write a clear and detailed answer..."
                className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 resize-y"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl transition-all shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" /> Post Answer
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-indigo-50 rounded-3xl p-8 text-center border border-indigo-100 flex flex-col items-center justify-center">
            <HelpCircle className="w-10 h-10 text-indigo-300 mb-4" />
            <p className="text-indigo-900 font-bold mb-4">You must be logged in to post an answer.</p>
            <Link 
              href={`/login?redirect=/community/${id}`} 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md transition-all active:scale-95"
            >
              Sign In to Answer
            </Link>
          </div>
        )
      ) : (
        <div className="bg-emerald-50 rounded-3xl p-8 text-center border border-emerald-100 flex flex-col items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-4" />
          <p className="text-emerald-800 font-black text-lg">This question has been resolved.</p>
          <p className="text-emerald-600 font-medium text-sm mt-1">No further answers can be submitted.</p>
        </div>
      )}

    </div>
  );
}
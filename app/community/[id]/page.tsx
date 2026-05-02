import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAnswer, acceptAnswer } from "../actions";

// Next.js 15 dynamic params standard
export default async function QuestionThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch the Question and all its Answers
  const question = await prisma.communityQuestion.findUnique({
    where: { id },
    include: {
      author: { select: { firstName: true, lastName: true } },
      subject: { select: { name: true } },
      answers: {
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: [
          { isAccepted: "desc" }, // Always put the accepted answer at the top
          { createdAt: "asc" }    // Then sort by oldest first
        ],
      },
    },
  });

  if (!question) {
    notFound();
  }

  // 2. Authenticate user to determine permissions
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isQuestionAuthor = user?.id === question.authorId;
  const isAuthenticated = !!user;

  // 3. Inline Server Actions (No Client JS needed)
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
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Community
        </Link>

        {/* ----------------------------------------- */}
        {/* THE QUESTION */}
        {/* ----------------------------------------- */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {question.subject && (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg">
                {question.subject.name}
              </span>
            )}
            {question.isResolved && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Resolved
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
            {question.title}
          </h1>

          <div className="prose prose-slate max-w-none mb-8 whitespace-pre-wrap font-medium text-slate-600">
            {question.body}
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              {question.author.firstName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                <Link href={`/profile/${question.authorId}`}>
                  {question.author.firstName} {question.author.lastName}
                </Link>
              </p>
              <p className="text-xs font-bold text-slate-400">
                {new Date(question.createdAt).toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------- */}
        {/* THE ANSWERS */}
        {/* ----------------------------------------- */}
        <h2 className="text-2xl font-black text-slate-900 mb-6">
          {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        <div className="space-y-6 mb-12">
          {question.answers.map((answer) => (
            <div 
              key={answer.id} 
              className={`bg-white rounded-2xl p-6 shadow-sm border ${answer.isAccepted ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200'}`}
            >
              {answer.isAccepted && (
                <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-wider mb-4 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Accepted Answer
                </div>
              )}

              <div className="whitespace-pre-wrap font-medium text-slate-700 mb-6">
                {answer.body}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    {answer.author.firstName[0]}
                  </span>
                  {answer.author.firstName} {answer.author.lastName}
                  <span className="mx-1 text-slate-300">•</span>
                  {new Date(answer.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                </div>

                {/* Mark as Accepted Form (Only visible to the question author if not yet resolved) */}
                {isQuestionAuthor && !question.isResolved && (
                  <form action={handleAcceptAnswer}>
                    <input type="hidden" name="answerId" value={answer.id} />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-bold text-xs rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                    >
                      Mark as Correct
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ----------------------------------------- */}
        {/* POST AN ANSWER FORM */}
        {/* ----------------------------------------- */}
        {!question.isResolved ? (
          isAuthenticated ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">Your Answer</h3>
              <form action={handlePostAnswer} className="space-y-4">
                <textarea
                  name="body"
                  rows={5}
                  placeholder="Share your knowledge to help out..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-y"
                  required
                />
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl transition-all shadow-md"
                  >
                    Post Answer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-2xl p-6 text-center border border-slate-200">
              <p className="text-slate-600 font-bold mb-4">You must be logged in to post an answer.</p>
              <Link href="/login" className="inline-block px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl shadow-sm hover:bg-slate-50">
                Log In
              </Link>
            </div>
          )
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
            <p className="text-emerald-700 font-bold flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              This question has been resolved. No further answers can be added.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
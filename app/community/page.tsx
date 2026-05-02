import prisma from "@/lib/prisma";
import Link from "next/link";

// Ensures the page always fetches the latest questions when users visit
export const dynamic = "force-dynamic";

export default async function CommunityBoardPage() {
  // Fetch all questions, including the author's name, the subject, and the total number of answers
  const questions = await prisma.communityQuestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { firstName: true, lastName: true, role: true },
      },
      subject: {
        select: { name: true },
      },
      _count: {
        select: { answers: true },
      },
    },
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Community Q&A
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Ask questions, get help from top tutors, and share your knowledge.
            </p>
          </div>
          
          <Link 
            href="/community/ask" 
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md hover:shadow-lg shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Ask a Question
          </Link>
        </div>

        {/* Questions Feed */}
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => (
              <Link 
                href={`/community/${question.id}`} 
                key={question.id}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-slate-300 group"
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                  
                  {/* Left Side: Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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

                    <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
                      {question.title}
                    </h2>
                    
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {question.body}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        {question.author.firstName[0]}
                      </div>
                      <span className="text-slate-600">
                        {question.author.firstName} {question.author.lastName}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                      <span>{new Date(question.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Right Side: Stats */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 mt-2 md:mt-0">
                    <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl min-w-20 ${question._count.answers > 0 ? (question.isResolved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-900 text-white') : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                      <span className="text-lg font-black leading-none">{question._count.answers}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                        {question._count.answers === 1 ? 'Answer' : 'Answers'}
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No questions yet</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
                Be the first to start a discussion! Ask a question and get answers from the community.
              </p>
              <Link 
                href="/community/ask" 
                className="inline-flex bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Ask the first question
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
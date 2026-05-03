// app/community/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  MessageCircle, 
  CheckCircle2, 
  User, 
  LibraryBig,
  HelpCircle,
  MessageSquarePlus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CommunityBoardPage() {
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
    <div className="space-y-4">
      {questions.length > 0 ? (
        questions.map((question) => (
          <Link 
            href={`/community/${question.id}`} 
            key={question.id}
            className="block bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              
              {/* Status Indicator */}
              <div className="shrink-0 mt-1">
                {question.isResolved ? (
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl" title="Resolved">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-xl border border-amber-100" title="Open Question">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {question.subject && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                      <LibraryBig className="w-3 h-3" /> {question.subject.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                  {question.title}
                </h2>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {question.body}
                </p>

                {/* Footer Metrics */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {question.author.firstName} {question.author.lastName[0]}.
                    </span>
                    {question.author.role === "TUTOR" && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] uppercase tracking-wider">Tutor</span>
                    )}
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                    question._count.answers > 0 
                      ? question.isResolved ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "bg-slate-50 text-slate-500 border border-slate-200"
                  }`}>
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {question._count.answers} {question._count.answers === 1 ? 'Answer' : 'Answers'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <MessageCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No questions yet</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
            Be the first to ask a question and start a discussion in the community!
          </p>
          <Link 
            href="/community/ask" 
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700"
          >
            <MessageSquarePlus className="w-4 h-4" /> Ask a Question
          </Link>
        </div>
      )}
    </div>
  );
}
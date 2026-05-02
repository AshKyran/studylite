import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ResearchHubPage() {
  // 1. Authentication & Gatekeeper Logic
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirect=/explore/research");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true }
  });

  // THE STRICT GATEKEEPER: Kick out free and 7-Day Trial users
  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=research");
  }

  // 2. Fetch all published research materials
  // Note: Using the Note model as defined in your schema to represent these materials
  const papers = await prisma.note.findMany({
    where: { isPublished: true },
    include: {
      author: {
        select: { firstName: true, lastName: true, qualification: true },
      },
      subject: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hub Header */}
        <header className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 right-40 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Premium Access Granted
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Advanced Research Hub
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              Explore deep-dive academic papers, theses, and premium study modules crafted by top-tier tutors and researchers.
            </p>
          </div>
        </header>

        {/* Filters & Search (UI Only for now) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-full sm:w-96 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search research titles, topics, or authors..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg whitespace-nowrap">All Subjects</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold rounded-lg whitespace-nowrap transition-colors">Computer Science</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold rounded-lg whitespace-nowrap transition-colors">Mathematics</button>
          </div>
        </div>

        {/* Research Grid */}
        {papers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <span className="text-4xl mb-4 block">📚</span>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Research Published Yet</h3>
            <p className="text-slate-500">Check back soon for premium academic materials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <Link 
                href={`/explore/research/${paper.id}`} 
                key={paper.id}
                className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                {/* Card Header / Banner */}
                <div className="h-32 bg-slate-100 relative p-6 flex flex-col justify-between">
                  <div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur-xs text-slate-800 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                      {paper.subject.name}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col grow">
                  <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed grow">
                    {paper.description}
                  </p>

                  {/* Author & Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {paper.author.firstName[0]}{paper.author.lastName[0]}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {paper.author.firstName} {paper.author.lastName}
                        </p>
                        {paper.author.qualification && (
                          <p className="text-xs text-slate-500 truncate">
                            {paper.author.qualification}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-blue-600 group-hover:translate-x-1 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
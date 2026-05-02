import Link from "next/link";
import { MessageSquarePlus, Flame, Hash, Info, Trophy, ShieldAlert } from "lucide-react";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Community Header Area */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">StudyLite Community</h1>
        <p className="mt-2 text-slate-500 font-medium">Ask questions, share knowledge, and collaborate with peers.</p>
        
        {/* Mobile "Ask" Button (Hidden on Desktop) */}
        <div className="mt-6 lg:hidden">
          <Link 
            href="/explore/forum/ask" 
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <MessageSquarePlus className="h-5 w-5" />
            Ask a Question
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* ==========================================
            MAIN CONTENT AREA (The Feed)
            ========================================== */}
        <main className="flex-1 min-w-0">
          {/* Forum Navigation Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-1.5 mb-6 flex items-center overflow-x-auto hide-scrollbar shadow-sm">
            <Link href="/explore/forum" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm shrink-0">
              <Flame className="h-4 w-4 text-orange-500" />
              Popular
            </Link>
            <Link href="/explore/forum/new" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-colors shrink-0">
              Newest
            </Link>
            <Link href="/explore/forum/unanswered" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-colors shrink-0">
              Unanswered
            </Link>
            <Link href="/explore/forum/my-posts" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-colors shrink-0">
              My Posts
            </Link>
          </div>

          {/* This is where your actual thread feed or post pages will render */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[500px]">
            {children}
          </div>
        </main>

        {/* ==========================================
            RIGHT SIDEBAR (Widgets)
            ========================================== */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6">
          
          {/* Primary Action */}
          <Link 
            href="/explore/forum/ask" 
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <MessageSquarePlus className="h-5 w-5" />
            Ask a Question
          </Link>

          {/* Widget 1: About */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-black">
              <Info className="h-5 w-5 text-blue-500" />
              <h3>About this Community</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
              StudyLite's Q&A Hub is a collaborative space for students and tutors. Earn reputation points by providing helpful, verified answers.
            </p>
            <div className="flex items-center gap-4 text-sm border-t border-slate-100 pt-4 mt-2">
              <div className="flex flex-col">
                <span className="font-black text-slate-900">12.4k</span>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Members</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900">842</span>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>
            </div>
          </div>

          {/* Widget 2: Trending Subjects */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-black">
              <Hash className="h-5 w-5 text-purple-500" />
              <h3>Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {['Computer Science', 'Calculus II', 'Macroeconomics', 'Organic Chemistry', 'Data Structures'].map((topic, i) => (
                <Link key={i} href={`/explore/forum/tag/${topic.toLowerCase().replace(' ', '-')}`} className="flex items-center justify-between group">
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
                    {topic}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    +{Math.floor(Math.random() * 50) + 10}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Widget 3: Top Contributors (Gamification) */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-5 font-black">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h3>Top Tutors This Week</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs border-2 border-slate-800">DR</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">Dr. Sarah Jenkins</p>
                  <p className="text-xs text-slate-400 truncate">Computer Science</p>
                </div>
                <div className="text-xs font-black text-amber-400">450 pts</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs border-2 border-slate-800">MK</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">Mark K.</p>
                  <p className="text-xs text-slate-400 truncate">Mathematics</p>
                </div>
                <div className="text-xs font-black text-amber-400">320 pts</div>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
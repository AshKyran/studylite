// app/community/layout.tsx
import Link from "next/link";
import { 
  MessageSquarePlus, 
  Flame, 
  Hash, 
  Info, 
  Trophy,
  Users
} from "lucide-react";

// --- STATIC DATA ---
const TRENDING_TOPICS = [
  { name: 'Computer Science', count: 42 },
  { name: 'Calculus II', count: 31 },
  { name: 'Macroeconomics', count: 58 },
  { name: 'Organic Chemistry', count: 24 },
  { name: 'Data Structures', count: 47 }
];

const TOP_TUTORS = [
  { name: "Dr. Sarah Jenkins", initial: "DR", subject: "Computer Science", points: 450, color: "bg-indigo-500" },
  { name: "Mark K.", initial: "MK", subject: "Mathematics", points: 320, color: "bg-emerald-500" }
];

// --- COMPONENTS ---

const AskButton = ({ className }: { className?: string }) => (
  <Link 
    href="/community/ask" 
    className={`flex items-center justify-center gap-2 rounded-xl bg-indigo-600 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 ${className}`}
  >
    <MessageSquarePlus className="w-5 h-5" /> 
    <span>Ask a Question</span>
  </Link>
);

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Area */}
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Users className="w-10 h-10 text-indigo-500" aria-hidden="true" /> 
          StudyLite Community
        </h1>
        <p className="mt-3 text-lg text-slate-500 font-medium">
          Ask questions, share knowledge, and collaborate with top peers and tutors.
        </p>
        
        {/* Mobile Ask Button */}
        <div className="mt-6 lg:hidden">
          <AskButton className="w-full px-4 py-3.5 text-sm" />
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Content Stage */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Desktop Ask Button */}
          <div className="hidden lg:block">
            <AskButton className="w-full px-4 py-4 text-base font-black shadow-indigo-200 hover:-translate-y-0.5" />
          </div>

          {/* Leaderboard Card */}
          <section className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white border border-slate-800">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold">Top Tutors This Week</h3>
            </div>
            <div className="space-y-5">
              {TOP_TUTORS.map((tutor) => (
                <div key={tutor.name} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${tutor.color} flex items-center justify-center font-bold text-sm border-2 border-slate-800 shrink-0`}>
                    {tutor.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-white">{tutor.name}</p>
                    <p className="text-xs text-slate-400 truncate">{tutor.subject}</p>
                  </div>
                  <div className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                    {tutor.points} pts
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Topics Card */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Flame className="h-5 w-5 text-rose-500" />
              <h3 className="font-bold text-slate-900">Trending Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TOPICS.map(topic => (
                <Link 
                  key={topic.name} 
                  href={`/community?topic=${encodeURIComponent(topic.name)}`} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                >
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> 
                  {topic.name}
                  <span className="text-slate-400 font-medium ml-1">({topic.count})</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Community Rules Card */}
          <section className="bg-blue-50 rounded-3xl p-6 border border-blue-100 text-blue-900">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1 rounded-lg bg-blue-100">
                <Info className="h-5 w-5 text-blue-600" />
              </span>
              <h3 className="font-bold">Community Rules</h3>
            </div>
            <ul className="space-y-3 text-xs font-medium text-blue-800">
              {[
                "Be respectful and constructive.",
                "No sharing of direct exam answers or cheating.",
                "Mark correct answers to reward helpful peers."
              ].map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        </aside>

      </div>
    </div>
  );
}
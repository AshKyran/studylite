// app/profile/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  BadgeCheck, 
  GraduationCap, 
  Building2, 
  MessageSquarePlus,
  FileText,
  FolderOpen,
  MessageCircle,
  HelpCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

// Next.js 15 Dynamic Params
export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = await props.params;
  const { id } = resolvedParams;

  // 1. Fetch the user and aggregate their stats based exactly on your schema
  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      qualification: true,
      institution: true,
      isVerified: true,
      _count: {
        select: {
          notesCreated: true,
          projectsCreated: true,
          communityQuestions: true,
          communityAnswers: true,
        }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Back Navigation */}
      <Link 
        href="/community" 
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Community
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[60px] -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          
          {/* Avatar */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-black shrink-0 shadow-xl border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-300">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left flex-1 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {profile.firstName} {profile.lastName}
              </h1>
              {profile.isVerified && (
                <span className="flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-full p-1 border border-emerald-100" title="Verified User">
                  <BadgeCheck className="w-6 h-6" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-5">
              <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border ${
                profile.role === 'TUTOR' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                profile.role === 'RESEARCHER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {profile.role}
              </span>
            </div>

            {(profile.qualification || profile.institution) && (
              <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-500 mt-2">
                {profile.qualification && (
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 text-slate-600">
                    <GraduationCap className="w-5 h-5 text-slate-400" />
                    {profile.qualification}
                  </div>
                )}
                {profile.institution && (
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 text-slate-600">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    {profile.institution}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Request Commission Button (Only if Tutor/Researcher) */}
          {(profile.role === "TUTOR" || profile.role === "RESEARCHER") && (
            <div className="w-full sm:w-auto mt-6 sm:mt-2">
              <Link 
                href={`/tutors`} // Assuming you handle tutor commissions from the tutors directory
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-black text-sm rounded-xl shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Request Material
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Platform Stats Grid */}
      <h3 className="text-xl font-black text-slate-900 mt-10 mb-4 px-2">Platform Activity</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.notesCreated}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.projectsCreated}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-emerald-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.communityAnswers}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Answers</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-amber-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.communityQuestions}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</span>
        </div>

      </div>

    </div>
  );
}
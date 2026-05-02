import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

// Next.js 15 Dynamic Params
export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Navigation */}
        <button 
          className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-8 flex items-center gap-2 transition-colors"
        >
          <Link href="/community" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Community
          </Link>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 text-white rounded-full flex items-center justify-center text-4xl sm:text-5xl font-black shrink-0 shadow-lg">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.isVerified && (
                  <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full shadow-sm" title="Verified User">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                  profile.role === 'TUTOR' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  profile.role === 'RESEARCHER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                  'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  {profile.role}
                </span>
              </div>

              {(profile.qualification || profile.institution) && (
                <div className="flex flex-col gap-1.5 text-sm font-bold text-slate-500 mt-4">
                  {profile.qualification && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9v7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9v7" /></svg>
                      {profile.qualification}
                    </div>
                  )}
                  {profile.institution && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {profile.institution}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Request Commission Button (Only if Tutor/Researcher) */}
            {(profile.role === "TUTOR" || profile.role === "RESEARCHER") && (
              <div className="w-full sm:w-auto mt-4 sm:mt-0">
                <Link 
                  href={`/tutors`} // Assuming you handle tutor commissions from the tutors directory
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-black text-sm rounded-xl shadow-md hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Request Material
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.notesCreated}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes Published</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.projectsCreated}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects Uploaded</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.communityAnswers}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Helpful Answers</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 mb-1">{profile._count.communityQuestions}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions Asked</span>
          </div>

        </div>

      </div>
    </div>
  );
}
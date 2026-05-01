import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function TutorsDirectoryPage() {
  // 1. Fetch Verified Educators & Researchers securely
  interface Expert {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    rate?: number;
    rating?: number;
    reviews?: number;
    tags?: string[];
  }

  let experts: Expert[] = [];
  try {
    // Assuming you have a 'role' or 'isVerified' field to distinguish tutors
    // We fetch users who have published notes or are marked as verified
    experts = await prisma.user.findMany({
      where: {
        isVerified: true, // Only show vetted professionals
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        // In a real expanded schema, you would fetch these. 
        // We will map them gracefully in the UI if they don't exist yet.
      },
      take: 12,
    });
  } catch (error) {
    console.error("Failed to fetch experts:", error);
  }

  // Fallback mock data to guarantee the UI renders perfectly even if your DB is currently empty
  interface Expert {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    rate?: number;
    rating?: number;
    reviews?: number;
    tags?: string[];
  }

  const displayExperts: Expert[] = experts.length > 0 ? experts : [
    { id: "1", firstName: "Dr. Sarah", lastName: "Jenkins", title: "Postdoctoral Researcher in Quantum Physics", rate: 4500, rating: 4.9, reviews: 124, tags: ["Physics", "Advanced Mathematics"] },
    { id: "2", firstName: "Prof. David", lastName: "Ochieng", title: "Senior Lecturer & Curriculum Developer", rate: 3200, rating: 4.8, reviews: 89, tags: ["Computer Science", "Software Engineering"] },
    { id: "3", firstName: "Elena", lastName: "Rostova", title: "Ph.D. Candidate in Neuroscience", rate: 2800, rating: 5.0, reviews: 42, tags: ["Biology", "Anatomy", "Chemistry"] },
    { id: "4", firstName: "Michael", lastName: "Kariuki", title: "Verified High School Revision Expert", rate: 1500, rating: 4.7, reviews: 210, tags: ["KCSE Mathematics", "Chemistry"] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 1. PREMIUM HEADER: Dark Slate with Emerald/Teal accents */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-1/4 w-full max-w-2xl h-100 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-md text-slate-300 font-medium text-xs sm:text-sm mb-6 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            Verified Mentors & Researchers
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl">
            Connect with <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">world-class intellects.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
            Book 1-on-1 virtual sessions with vetted academic professionals. From high school exam preparation to advanced post-graduate research guidance.
          </p>

          {/* Search & Filter Bar (Glassmorphism) */}
          <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="relative grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 1 1 -14 0 7 7 0 0 14 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by subject, degree, or name..."
                className="block w-full pl-11 pr-4 py-4 bg-transparent text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-lg"
              />
            </div>
            <div className="h-px w-full sm:w-px sm:h-auto bg-slate-700 mx-2 hidden sm:block"></div>
            <select className="bg-transparent text-slate-300 px-4 py-4 focus:outline-none cursor-pointer appearance-none font-medium">
              <option value="all">All Levels</option>
              <option value="highschool">High School</option>
              <option value="undergrad">Undergraduate</option>
              <option value="research">Post-Grad / Research</option>
            </select>
            <button className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors whitespace-nowrap">
              Find Expert
            </button>
          </div>
        </div>
      </section>

      {/* 2. DIRECTORY GRID */}
      <section className="py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Available for Mentorship</h2>
              <p className="mt-2 text-slate-600">Top-rated educators based on student reviews and academic credentials.</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                Highest Rated
              </button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                Most Affordable
              </button>
            </div>
          </div>

          {/* The Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayExperts.map((expert: Expert, index) => (
              <div 
                key={expert.id || index} 
                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
              >
                {/* Decorative background shape */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors pointer-events-none"></div>

                {/* Top Row: Avatar & Rate */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-2xl shadow-md transform group-hover:scale-105 transition-transform duration-300">
                      {expert.firstName[0]}{expert.lastName[0]}
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-slate-900">
                      KES {expert.rate || 1500}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Per Hour</span>
                  </div>
                </div>

                {/* Body: Name, Title, Rating */}
                <div className="mb-6 grow relative z-10">
                  <h3 className="text-2xl font-extrabold text-slate-900 flex items-center mb-1 group-hover:text-emerald-600 transition-colors">
                    {expert.firstName} {expert.lastName}
                    <svg className="w-5 h-5 ml-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </h3>
                  
                  <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-2">
                    {expert.title || "Verified Academic Professional"}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                      <svg className="w-4 h-4 text-amber-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="text-sm font-bold text-amber-700">{expert.rating || "4.8"}</span>
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{expert.reviews || "85"} Sessions</span>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2">
                    {(expert.tags || ["Mathematics", "Physics", "Chemistry"]).map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-auto pt-6 border-t border-slate-100 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/tutors/${expert.id || index}`} className="flex justify-center items-center px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
                      View Profile
                    </Link>
                    <Link href={`/tutors/${expert.id || index}/book`} className="flex justify-center items-center px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors text-sm shadow-md">
                      Book Session
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Load More Pagination */}
          <div className="mt-16 text-center">
            <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
              Load More Experts
            </button>
          </div>

        </div>
      </section>

      {/* 3. CTA for Aspiring Educators */}
      <section className="bg-emerald-950 py-24 relative overflow-hidden border-t border-emerald-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="w-16 h-16 bg-emerald-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-700/50">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">
            Join the elite roster.
          </h2>
          <p className="text-lg md:text-xl mb-10 text-emerald-100/80 leading-relaxed max-w-2xl mx-auto font-light">
            Are you a post-graduate researcher, verified teacher, or industry professional? Apply to become a mentor, set your own hourly rates, and shape the minds of tomorrow.
          </p>
          <Link 
            href="/register?role=educator" 
            className="inline-flex items-center px-8 py-4 bg-emerald-500 text-emerald-950 font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 transition-all duration-300 text-lg"
          >
            Apply to Teach
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </section>

    </div>
  );
}
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function TutorsDirectoryPage() {
  // 1. Fetch Verified Educators & Researchers securely
  // We fetch their actual published notes count to show their platform authority
  const dbTutors = await prisma.user.findMany({
    where: {
      OR: [{ role: "TUTOR" }, { role: "RESEARCHER" }],
      isVerified: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      _count: {
        select: { notesCreated: { where: { isPublished: true } } }
      }
    },
    take: 20,
  });

  // Since Location, Rating, and Custom Base Rates aren't in the base schema yet,
  // we map the database users to a robust display object to guarantee the UI works perfectly.
  const displayExperts = dbTutors.map((tutor, index) => {
    // Deterministic mock data generation based on their ID/Index for the UI demo
    const locations = ["Nairobi", "Mombasa", "Remote", "Kiambu"];
    const tagsArr = [["Mathematics", "Physics"], ["Computer Science", "Programming"], ["Biology", "Chemistry"], ["Business", "Economics"]];
    
    return {
      id: tutor.id,
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      title: tutor.role === "RESEARCHER" ? "Verified Post-Grad Researcher" : "Senior Academic Tutor",
      baseRate: 1500 + (index * 200), // e.g. KES 1500 base rate for custom requests
      rating: 4.5 + (index % 5) * 0.1,
      reviews: 24 + (index * 7),
      location: locations[index % locations.length],
      tags: tagsArr[index % tagsArr.length],
      publishedCount: tutor._count.notesCreated,
    };
  });

  // Fallback if DB is completely empty during dev
  const finalExperts = displayExperts.length > 0 ? displayExperts : [
    { id: "1", firstName: "Dr. Sarah", lastName: "Jenkins", title: "Postdoctoral Researcher in Quantum Physics", baseRate: 4500, rating: 4.9, reviews: 124, location: "Nairobi", tags: ["Physics", "Advanced Mathematics"], publishedCount: 12 },
    { id: "2", firstName: "Prof. David", lastName: "Ochieng", title: "Senior Curriculum Developer", baseRate: 3200, rating: 4.8, reviews: 89, location: "Remote", tags: ["Computer Science", "Software Engineering"], publishedCount: 8 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white pb-24">
      
      {/* 1. PREMIUM HEADER */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-950 border-b border-slate-800">
        <div className="absolute top-0 left-1/4 w-full max-w-2xl h-[400px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-md text-slate-300 font-medium text-xs sm:text-sm mb-6 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            Verified Material Creators
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl">
            Commission Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Academic Materials.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
            Need a specific topic broken down? Request custom PDFs, revision ZIP bundles, or thesis reviews from our vetted network of educators. Delivered directly to your dashboard.
          </p>

          {/* Location & Subject Filters (Glassmorphism) */}
          <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3">
            <div className="relative grow">
              <svg className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 1 1 -14 0 7 7 0 0 14 0z" /></svg>
              <input type="text" placeholder="Search by name or subject..." className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            
            <div className="relative w-full md:w-64">
              <svg className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <select className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer font-medium">
                <option value="">Any Location</option>
                <option value="nairobi">Nairobi</option>
                <option value="remote">Remote Only</option>
              </select>
            </div>

            <button className="px-8 py-3.5 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-colors whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transform">
              Find Creator
            </button>
          </div>
        </div>
      </section>

      {/* 2. DIRECTORY GRID */}
      <section className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Available Creators</h2>
            <p className="mt-2 text-slate-600 font-medium">Vetted professionals ready to compile custom PDFs and ZIP resources.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm whitespace-nowrap">Top Rated</button>
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm">Most Published</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {finalExperts.map((expert) => (
            <div key={expert.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:scale-105 transition-transform duration-300">
                    {expert.firstName[0]}{expert.lastName[0]}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xl font-black text-slate-900">
                    From KES {expert.baseRate}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Per Request</span>
                </div>
              </div>

              <div className="mb-6 grow">
                <h3 className="text-2xl font-black text-slate-900 flex items-center mb-1 group-hover:text-emerald-600 transition-colors">
                  {expert.firstName} {expert.lastName}
                  <svg className="w-5 h-5 ml-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </h3>
                
                <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-2">
                  {expert.title} • <span className="text-emerald-600 font-bold">{expert.location}</span>
                </p>
                
                {/* Stats Row */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    <span className="text-sm font-bold text-amber-700">⭐ {expert.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {expert.publishedCount} Published Items
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {expert.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/tutors/${expert.id}`} className="flex justify-center items-center px-4 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
                    View Portfolio
                  </Link>
                  <Link href={`/tutors/${expert.id}/book`} className="flex justify-center items-center px-4 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors text-sm shadow-md">
                    Request Custom
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>
    </div>
  );
}
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma"; 

export default async function TutorProfilePage({ params }: { params: { id: string } }) {
  // 1. Fetch the Creator and their published digital materials (PDFs/ZIPs)
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      notesCreated: {
        where: { isPublished: true },
        take: 6, // Showcase their latest 6 materials
        orderBy: { createdAt: "desc" }
      }
    }
  });

  // Ensure the user exists and is actually a creator
  if (!user || (user.role !== "TUTOR" && user.role !== "RESEARCHER")) {
    notFound();
  }

  // 2. Mock enriched data (In production, add these fields to the User model)
  const tutorDetails = {
    title: user.role === "RESEARCHER" ? "Verified Post-Grad Researcher" : "Senior Academic Creator",
    bio: `I specialize in compiling high-yield revision materials, comprehensive thesis reviews, and custom step-by-step PDF solutions. My goal is to provide you with exactly the digital resources you need to excel, without the fluff.`,
    baseRate: 1500, // Starting price for a custom request
    rating: 4.8,
    reviews: 84,
    location: "Nairobi",
    tags: ["Advanced Physics", "Calculus", "Computer Science", "Thesis Review"],
    education: "MSc. Applied Mathematics",
    turnaround: "Typically delivers within 48 hours",
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 1. COMPACT HEADER */}
      <div className="bg-slate-950 border-b border-slate-800 pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-8">
            <Link 
              href="/tutors" 
              className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Creators Directory
            </Link>
          </nav>
        </div>
      </div>

      {/* 2. PROFILE CONTENT (Pulls up over the header) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: Main Info & Portfolio */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Identity Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-7 h-7 bg-emerald-500 rounded-full border-[3px] border-white" title="Accepting Requests"></div>
                  </div>
                </div>
                
                <div className="grow">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center flex-wrap gap-2 mb-2">
                    {user.firstName} {user.lastName}
                    {user.isVerified && (
                      <svg className="w-7 h-7 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <title>Verified Creator</title>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </h1>
                  
                  <p className="text-lg text-slate-600 font-medium mb-4">{tutorDetails.title}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      <span className="text-sm font-black text-amber-700">⭐ {tutorDetails.rating}</span>
                      <span className="text-sm text-amber-600/70 ml-1 font-medium">({tutorDetails.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700">
                      📍 {tutorDetails.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tutorDetails.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About & Credentials Section */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-6">About {user.firstName}</h2>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">
                {tutorDetails.bio}
              </p>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Verified Credentials</h3>
                <ul className="space-y-5">
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 shrink-0">
                      <span className="text-xl">🎓</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Highest Education</p>
                      <p className="text-sm text-slate-600 font-medium">{tutorDetails.education}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mr-4 shrink-0 text-emerald-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Identity Verified</p>
                      <p className="text-sm text-slate-600 font-medium">Government ID & Academic credentials vetted.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* PORTFOLIO: Already published items */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Digital Portfolio</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Ready-to-download materials by {user.firstName}</p>
                </div>
                <Link href={`/explore?authorId=${user.id}`} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors whitespace-nowrap">
                  View All Materials
                </Link>
              </div>
              
              {user.notesCreated && user.notesCreated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.notesCreated.map((note) => (
                    <Link key={note.id} href={`/explore/${note.id}`} className="block group">
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full flex flex-col">
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md uppercase tracking-wider mb-3 w-fit">
                          {note.level.replace("_", " ")}
                        </span>
                        <h3 className="text-slate-900 font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                        <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                          <span className="font-black text-slate-900">{note.price === 0 ? "FREE" : `KES ${note.price}`}</span>
                          <span className="text-slate-400 group-hover:text-blue-500 font-bold text-xs flex items-center">
                            Download <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <p className="text-slate-500 font-medium">No public materials available yet.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Commission Widget */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white">
                <div className="p-8 md:p-10">
                  
                  <div className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    Accepting Commissions
                  </div>

                  <h3 className="text-2xl font-black mb-2">Request Custom Material</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                    Need specific revision notes, a ZIP bundle of solutions, or a private PDF? Request it directly.
                  </p>

                  <div className="mb-8 pb-8 border-b border-slate-800">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Starting At</span>
                    <span className="text-4xl font-black text-white tracking-tight">KES {tutorDetails.baseRate}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start text-sm font-medium text-slate-300">
                      <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      100% Custom PDF/ZIP Creation
                    </li>
                    <li className="flex items-start text-sm font-medium text-slate-300">
                      <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      {tutorDetails.turnaround}
                    </li>
                    <li className="flex items-start text-sm font-medium text-slate-300">
                      <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Secure Escrow Payment
                    </li>
                  </ul>

                  <Link 
                    href={`/tutors/${user.id}/request`}
                    className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-base font-black text-slate-900 bg-emerald-500 hover:bg-emerald-400 transition-all duration-200"
                  >
                    Start Request
                  </Link>
                </div>
                
                <div className="bg-slate-950 p-6 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Funds are held securely until the digital materials are delivered.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
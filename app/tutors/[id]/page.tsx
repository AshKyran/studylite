import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TutorProfilePage({ params }: { params: { id: string } }) {
  // 1. Fetch the User (Tutor) and their published notes
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      notesCreated: {
        where: { isPublished: true },
        take: 3, // Cross-sell their top 3 materials
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Fallback data for fields that might not exist in your base Prisma schema yet
  // In a production app, you would add these to the User model.
  const tutorDetails = {
    title: "Postdoctoral Researcher & Verified Mentor",
    bio: "I specialize in simplifying complex scientific and mathematical concepts. With over 8 years of experience teaching both high school revision classes and university-level post-graduate candidates, my goal is to help you achieve absolute mastery over your curriculum. I am currently leading research in quantum computing applications at the National Science Institute.",
    hourlyRate: 2500,
    rating: 4.9,
    reviews: 142,
    tags: ["Advanced Physics", "Calculus", "Computer Science", "Thesis Review"],
    education: "Ph.D. in Physics, University of Nairobi",
    availability: "Usually responds within 2 hours",
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 1. COMPACT HEADER */}
      <div className="bg-slate-950 border-b border-slate-800 pb-12 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-8">
            <Link 
              href="/tutors" 
              className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Directory
            </Link>
          </nav>
        </div>
      </div>

      {/* 2. PROFILE CONTENT (Pulls up over the header) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: Main Info */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Main Identity Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-4xl shadow-xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-7 h-7 bg-emerald-500 rounded-full border-[3px] border-white" title="Online Now"></div>
                  </div>
                </div>
                
                <div className="grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center">
                      {user.firstName} {user.lastName}
                      {user.isVerified && (
                        <svg className="w-7 h-7 ml-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <title>Verified Expert</title>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </h1>
                  </div>
                  <p className="text-lg text-slate-600 font-medium mb-4">{tutorDetails.title}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="text-sm font-bold text-slate-800">{tutorDetails.rating}</span>
                      <span className="text-sm text-slate-500 ml-1">({tutorDetails.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-700">
                      <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {tutorDetails.availability}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tutorDetails.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About / Bio Section */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">About {user.firstName}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                {tutorDetails.bio}
              </p>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Credentials & Verification</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Highest Education</p>
                      <p className="text-sm text-slate-600">{tutorDetails.education}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Identity Verified</p>
                      <p className="text-sm text-slate-600">Government ID securely vetted by platform.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cross-Sell: Tutor's Published Notes */}
            {user.notesCreated && user.notesCreated.length > 0 && (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Study Materials by {user.firstName}</h2>
                  <Link href={`/explore?authorId=${user.id}`} className="text-emerald-600 text-sm font-bold hover:text-emerald-700">
                    View All &rarr;
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.notesCreated.map((note) => (
                    <Link key={note.id} href={`/explore/${note.id}`} className="block group">
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all h-full flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{note.level.replace("_", " ")}</span>
                        <h3 className="text-slate-900 font-bold mb-3 group-hover:text-emerald-600 line-clamp-2">{note.title}</h3>
                        <div className="mt-auto flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-900">{note.price === 0 ? "FREE" : `KES ${note.price}`}</span>
                          <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Booking Widget */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-end justify-between mb-8 pb-8 border-b border-slate-100">
                    <div>
                      <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Session Rate</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tight">KES {tutorDetails.hourlyRate}</span>
                    </div>
                    <span className="text-slate-500 font-medium pb-1">/ hour</span>
                  </div>

                  {/* Mock Interactive Booking Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select Duration</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-sm">1 Hour</button>
                        <button className="py-3 border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold rounded-xl text-sm transition-colors">2 Hours</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Format</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none">
                        <option>Virtual (Google Meet/Zoom)</option>
                        <option>In-Person (Campus Library)</option>
                      </select>
                    </div>

                    <Link 
                      href={`/tutors/${user.id}/book`}
                      className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-md text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
                    >
                      Schedule Session
                    </Link>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-6 border-t border-slate-100">
                  <p className="text-xs text-center text-slate-500 leading-relaxed font-medium">
                    You won&apos;t be charged until the mentor confirms your request. Payments are held securely in escrow.
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
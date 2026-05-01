import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ExplorePage() {
  // 1. Fetch data securely with error handling
  let notes = [];
  try {
    notes = await prisma.note.findMany({
      where: {
        isPublished: true,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, isVerified: true },
        },
        subject: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch marketplace notes:", error);
    // In a real app, you might trigger a Sentry error here
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-blue-200 selection:text-blue-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* 1. PREMIUM HEADER & SEARCH UI */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Abstract background accent */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4">
            <div className="w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Marketplace
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mb-8">
              Discover peer-reviewed study guides, advanced college notes, and high school revision materials from top educators and researchers.
            </p>

            {/* Functional Search Bar Mockup (Ready for URL param wiring) */}
            <form className="flex flex-col sm:flex-row gap-3 max-w-3xl">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by subject, topic, or author..."
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button 
                type="button" 
                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center whitespace-nowrap"
              >
                Search Notes
              </button>
            </form>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 self-center">Popular:</span>
              {["Mathematics", "Medicine", "Computer Science", "Law", "High School Revision"].map((tag) => (
                <button key={tag} className="px-4 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. MARKETPLACE GRID */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">No materials found</h3>
            <p className="mt-2 text-slate-500 max-w-sm text-center">We couldn't find any published notes matching your criteria. Be the first to upload one!</p>
            <Link href="/dashboard/upload" className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors">
              Upload Study Material
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              // The entire card must be a clickable link to the detailed note page
              <Link 
                href={`/explore/${note.id}`} 
                key={note.id} 
                className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                
                {/* Premium Gradient Header (Simulates a document cover) */}
                <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 relative p-4 flex items-start justify-between">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <span className="relative z-10 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                    {note.level.replace("_", " ")}
                  </span>
                  <div className="relative z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm flex items-center">
                    <span className="text-sm font-extrabold text-slate-900">
                      {note.price === 0 ? "FREE" : `KES ${note.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    {note.subject.name}
                  </span>
                  
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow">
                    {note.description}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center pt-4 border-t border-slate-100 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {note.author.firstName[0]}{note.author.lastName[0]}
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className="text-xs text-slate-500">Authored by</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center">
                        {note.author.firstName} {note.author.lastName}
                        {note.author.isVerified && (
                          <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" title="Verified Educator/Researcher">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
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
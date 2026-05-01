import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PurchaseCard from "@/components/PurchaseCard";

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
  // Fetch note by ID securely
  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { firstName: true, lastName: true, isVerified: true },
      },
      subject: {
        select: { name: true },
      },
    },
  });

  // Automatically trigger a 404 page if someone types a fake ID in the URL or if it's unpublished
  if (!note || !note.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-blue-200 selection:text-blue-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <Link 
            href="/explore" 
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Marketplace
          </Link>
        </nav>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Main Content Column (Spans 2 cols on Desktop) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Header & Title Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 relative overflow-hidden">
              {/* Subtle background element */}
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/></svg>
              </div>

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wide border border-blue-100">
                    {note.subject.name}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                    {note.level.replace("_", " ")}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-8">
                  {note.title}
                </h1>
                
                {/* Author Info Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {note.author.firstName[0]}{note.author.lastName[0]}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-bold text-slate-900 flex items-center">
                        {note.author.firstName} {note.author.lastName}
                        {note.author.isVerified && (
                          <svg className="w-5 h-5 ml-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Published {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mock Rating/Quality Stats to build trust */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-amber-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      4.9 (12)
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-slate-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      850+ Views
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview (Mockup) & Description */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Fake Document Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <span className="text-white font-semibold text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Document Overview
                </span>
                <span className="text-slate-400 text-xs font-medium">Watermarked Preview</span>
              </div>
              
              <div className="p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">About this material</h2>
                
                {/* Description text */}
                <div className="prose prose-slate prose-blue max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap mb-10">
                  {note.description}
                </div>

                {/* What's included block */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">What&apos;s included</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Comprehensive coverage of syllabus", "Step-by-step worked examples", "High-quality diagrams and charts", "Printable PDF format"].map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Checkout Column (Sticks to top on Desktop) */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* The existing PurchaseCard component wrapped in a premium container */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <PurchaseCard 
                  noteId={note.id} 
                  price={note.price} 
                  contentUrl={note.contentUrl} 
                />
                
                {/* Trust Signals below the purchase card */}
                <div className="bg-slate-50 p-6 border-t border-slate-100">
                  <ul className="space-y-4">
                    <li className="flex items-center text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <span className="font-medium">Secure, encrypted checkout</span>
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </div>
                      <span className="font-medium">Instant download access</span>
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <span className="font-medium">Quality guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Educator CTA Banner */}
              <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-md text-white">
                <h4 className="text-lg font-bold mb-2">Have notes like this?</h4>
                <p className="text-slate-300 text-sm mb-4">Join our network of educators and monetize your academic materials today.</p>
                <Link href="/register?role=educator" className="inline-block w-full text-center px-4 py-2.5 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
                  Start Selling
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
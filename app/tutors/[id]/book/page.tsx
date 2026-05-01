// app/tutors/[id]/book/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingForm from "./BookingForm";

export default async function BookingPage({ params }: { params: { id: string } }) {
  // Fetch the tutor's details securely from the database
  const tutor = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      // Fallback rate if you haven't added 'hourlyRate' to your User schema yet
    }
  });

  if (!tutor) {
    notFound();
  }

  // Assuming a default rate for now. In production, this comes from `tutor.hourlyRate`
  const hourlyRate = 2500; 

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <nav className="mb-8">
          <Link 
            href={`/tutors/${tutor.id}`} 
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to {tutor.firstName}&apos;s Profile
          </Link>
        </nav>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-slate-950 px-8 py-10 text-white relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-2 relative z-10">
              Schedule a Session
            </h1>
            <p className="text-slate-400 font-medium relative z-10">
              Booking a 1-on-1 mentorship session with <span className="text-emerald-400">{tutor.firstName} {tutor.lastName}</span>
            </p>
          </div>

          <div className="p-8 md:p-10">
            {/* The Interactive Client Form */}
            <BookingForm tutorId={tutor.id} tutorName={tutor.firstName} hourlyRate={hourlyRate} />
          </div>
        </div>

      </div>
    </div>
  );
}
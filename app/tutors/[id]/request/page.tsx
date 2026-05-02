import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RequestForm from "./RequestForm";
import prisma from "@/lib/prisma";

export default async function RequestMaterialPage({ params }: { params: { id: string } }) {
  // 1. Strict Authentication
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirect=/tutors/${params.id}/request`);
  }

  // 2. Fetch the Tutor
  const tutor = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, firstName: true, lastName: true, role: true }
  });

  if (!tutor || (tutor.role !== "TUTOR" && tutor.role !== "RESEARCHER")) {
    notFound();
  }

  // Fallback base rate (In production, pull this from tutor.baseRate)
  const baseRate = 1500;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Navigation */}
        <nav className="mb-8">
          <Link 
            href={`/tutors/${tutor.id}`} 
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors group"
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
          
          {/* Aesthetic Banner */}
          <div className="bg-slate-950 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 relative z-10">
              Commission Material
            </h1>
            <p className="text-slate-400 font-medium relative z-10 text-sm md:text-base">
              Request a custom PDF or ZIP bundle from <span className="text-emerald-400 font-bold">{tutor.firstName} {tutor.lastName}</span>
            </p>
          </div>

          <div className="p-8 md:p-10">
            {/* The Interactive Form */}
            <RequestForm tutorId={tutor.id} tutorName={tutor.firstName} baseRate={baseRate} />
          </div>
        </div>

      </div>
    </div>
  );
}
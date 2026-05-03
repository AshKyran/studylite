// app/tutors/[id]/request/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RequestForm from "./RequestForm";
import prisma from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequestMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  // UPGRADE: Next.js 15 strictly requires params to be awaited
  const resolvedParams = await params;
  
  // 1. Strict Authentication
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirect=/tutors/${resolvedParams.id}/request`);
  }

  // 2. Fetch the Tutor
  const tutor = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    select: { id: true, firstName: true, lastName: true, role: true }
  });

  if (!tutor || (tutor.role !== "TUTOR" && tutor.role !== "RESEARCHER")) {
    notFound();
  }

  // Fallback base rate (In production, pull this from tutor.baseRate if it exists in schema)
  const baseRate = 1500;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 pt-12 pb-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Navigation */}
        <nav className="mb-8">
          <Link 
            href={`/tutors/${tutor.id}`} 
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
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
              Request a custom PDF or ZIP bundle from <span className="text-emerald-400 font-bold">{tutor.firstName}</span>. Funds are securely held in Escrow.
            </p>
          </div>

          <div className="p-8">
            <RequestForm tutorId={tutor.id} tutorName={tutor.firstName} baseRate={baseRate} />
          </div>
        </div>
      </div>
    </div>
  );
}
// app/(explore)/tests/generator/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import GeneratorForm from "./GeneratorForm";
import { BrainCircuit, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExamGeneratorPage() {
  // 1. Strict Gatekeeper Logic
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login?redirect=/explore/tests/generator");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true }
  });

  // Free and 7-Day Trial users cannot generate custom PDFs!
  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=pdf_generator");
  }

  // 2. Fetch live subjects from your database to populate the dropdown
  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12 sm:py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-xs mb-4">
              <Sparkles className="w-4 h-4" /> AI PDF Generator
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 shrink-0 text-indigo-400" />
              Build Custom Exams
            </h1>
            <p className="text-indigo-100/80 font-medium text-lg max-w-2xl">
              Select your subject and parameters below to instantly generate a printable PDF exam complete with an official marking scheme.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <GeneratorForm subjects={subjects} />
        </div>

      </div>
    </div>
  );
}
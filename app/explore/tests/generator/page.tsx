import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import GeneratorForm from "./GeneratorForm";


export default async function ExamGeneratorPage() {
  // 1. Strict Gatekeeper Logic
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
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
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12 sm:py-16 lg:py-24 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <GeneratorForm subjects={subjects} />
      </div>
    </div>
  );
}
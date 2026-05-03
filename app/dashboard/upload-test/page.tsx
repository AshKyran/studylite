// app/dashboard/upload-test/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadTestForm from "./UploadTestForm";

export const dynamic = "force-dynamic";

export default async function TutorUploadTestPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, isProfileComplete: true }
  });

  // STRICT GATEKEEPER: Only verified creators
  if (dbUser?.role !== "TUTOR" && dbUser?.role !== "RESEARCHER") {
    redirect("/dashboard?error=unauthorized_creator");
  }

  if (!dbUser.isProfileComplete) {
    redirect("/dashboard/onboarding");
  }

  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Assessment Builder
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Create high-quality exams, quizzes, and live tests for the StudyLite community.
        </p>
      </div>
      <UploadTestForm subjects={subjects} />
    </div>
  );
}
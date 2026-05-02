import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadTestForm from "./UploadTestForm";

export default async function TutorUploadTestPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true }
  });

  // STRICT GATEKEEPER: Only Tutors and Researchers can build tests
  if (dbUser?.role !== "TUTOR" && dbUser?.role !== "RESEARCHER") {
    redirect("/dashboard?error=unauthorized_creator");
  }

  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Assessment Builder
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Create high-quality exams, quizzes, and live tests for the StudyLite community.
          </p>
        </div>

        <UploadTestForm subjects={subjects} />
      </div>
    </div>
  );
}
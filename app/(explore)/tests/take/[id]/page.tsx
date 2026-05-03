// app/(explore)/tests/take/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TestArena from "./TestArena"; 

export const dynamic = "force-dynamic";

export default async function TakeTestPage(props: { params: Promise<{ id: string }> }) {
  // UPGRADE: Await params for Next.js 15
  const resolvedParams = await props.params;
  const examId = resolvedParams.id;

  // 1. Strict Authentication & Premium Gatekeeper
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect(`/login?redirect=/explore/tests/take/${examId}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, isSubscribed: true, subscriptionPlan: true }
  });

  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=tests");
  }

  // 2. Fetch the Exam & Questions
  const rawExam = await prisma.exam.findUnique({
    where: { id: examId, isPublished: true },
    include: {
      subject: {
        select: { name: true },
      },
      questions: {
        include: {
          // ANTI-CHEAT: We explicitly DO NOT select `isCorrect` or `explanation` here.
          // The client will only know the ID and text of the options.
          options: {
            select: { id: true, text: true }
          }
        }
      }
    }
  });

  if (!rawExam) notFound();

  const previousAttempts = await prisma.examAttempt.count({
    where: { userId: dbUser.id, examId: examId }
  });

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Pass the sanitized exam data to the Client Component */}
      <TestArena exam={rawExam} userId={dbUser.id} previousAttempts={previousAttempts} />
    </div>
  );
}
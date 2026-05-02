import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TestArena from "./TestArena"; 

export default async function TakeTestPage({
  params,
}: {
  params: { id: string };
}) {
  // 1. Strict Authentication & Premium Gatekeeper
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirect=/explore/tests/take/${params.id}`);
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
    where: { id: params.id, isPublished: true },
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

  // 3. Optional: Check if the user has already taken this test
  // If this is a strict 1-time exam, we could redirect them away here.
  // For practice quizzes, we let them retake it.
  const previousAttempts = await prisma.examAttempt.count({
    where: { userId: dbUser.id, examId: params.id }
  });

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-rose-500 selection:text-white">
      {/* Pass the sanitized exam data to the Client Component.
        The client handles the timer, UI, and user selections.
      */}
      <TestArena 
        exam={rawExam} 
        userId={dbUser.id} 
        previousAttempts={previousAttempts} 
      />
    </div>
  );
}
// app/(explore)/tests/take/[id]/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export interface SubmitTestPayload {
  examId: string;
  answers: Record<string, string>; // Maps questionId -> selectedOptionId
}

export async function submitTestAttempt(data: SubmitTestPayload) {
  // 1. Strict Authentication
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    return { error: "Unauthorized: You must be logged in to submit a test." };
  }

  try {
    // 2. Fetch the REAL exam with the correct answers (which the client never saw)
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      include: {
        questions: {
          include: {
            options: true, // This includes the `isCorrect` boolean from the DB
          }
        }
      }
    });

    if (!exam) {
      return { error: "Exam not found or no longer available." };
    }

    // 3. The Grading Algorithm
    let finalScore = 0;
    let maxPossibleScore = 0;

    for (const question of exam.questions) {
      maxPossibleScore += question.marks;

      const correctOption = question.options.find(opt => opt.isCorrect);
      const userSelectedOptionId = data.answers[question.id];

      // If they match, award the marks!
      if (correctOption && userSelectedOptionId === correctOption.id) {
        finalScore += question.marks;
      }
    }

    // 4. Save the Attempt to the Database
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: authUser.id,
        examId: exam.id,
        score: finalScore,
        maxScore: maxPossibleScore,
      }
    });

    // 5. Return the Attempt ID so the client can redirect to the results page
    return { success: true, attemptId: attempt.id };

  } catch (error: unknown) {
    console.error("Grading Engine Error:", error);
    return { error: "An unexpected error occurred while grading your assessment. Please contact support." };
  }
}
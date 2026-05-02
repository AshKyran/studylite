"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- STRICT TYPES ---
export interface CreateQuestionPayload {
  title: string;
  body: string;
  subjectId?: string | null;
}

export interface CreateAnswerPayload {
  questionId: string;
  body: string;
}

/**
 * 1. Creates a new Community Question
 */
export async function createQuestion(payload: CreateQuestionPayload) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new Error("You must be logged in to ask a question.");
  }

  if (!payload.title.trim() || !payload.body.trim()) {
    throw new Error("Title and body are required.");
  }

  try {
    const newQuestion = await prisma.communityQuestion.create({
      data: {
        title: payload.title,
        body: payload.body,
        authorId: authUser.id,
        subjectId: payload.subjectId || null,
      },
    });

    revalidatePath("/community");
    return { success: true, questionId: newQuestion.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create question.";
    console.error("Create Question Error:", err);
    throw new Error(errorMessage);
  }
}

/**
 * 2. Posts an Answer to an existing Question
 */
export async function createAnswer(payload: CreateAnswerPayload) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new Error("You must be logged in to answer a question.");
  }

  if (!payload.body.trim()) {
    throw new Error("Answer body cannot be empty.");
  }

  try {
    await prisma.communityAnswer.create({
      data: {
        body: payload.body,
        questionId: payload.questionId,
        authorId: authUser.id,
      },
    });

    revalidatePath(`/community/${payload.questionId}`);
    revalidatePath("/community");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to post answer.";
    console.error("Create Answer Error:", err);
    throw new Error(errorMessage);
  }
}

/**
 * 3. Marks a Question as Resolved and an Answer as Accepted
 * SECURITY: Only the original author of the question can do this.
 */
export async function acceptAnswer(questionId: string, answerId: string) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new Error("Unauthorized");
  }

  // Verify the user owns the question
  const question = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    select: { authorId: true, isResolved: true },
  });

  if (!question) throw new Error("Question not found.");
  if (question.authorId !== authUser.id) throw new Error("Only the author can accept an answer.");
  if (question.isResolved) throw new Error("This question is already resolved.");

  try {
    await prisma.$transaction(async (tx) => {
      // Mark answer as accepted
      await tx.communityAnswer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      });

      // Mark question as resolved
      await tx.communityQuestion.update({
        where: { id: questionId },
        data: { isResolved: true },
      });
    });

    revalidatePath(`/community/${questionId}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to accept answer.";
    console.error("Accept Answer Error:", err);
    throw new Error(errorMessage);
  }
}
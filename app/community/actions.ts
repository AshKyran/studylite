// app/community/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
    return { error: "You must be logged in to ask a question." };
  }

  if (!payload.title.trim() || !payload.body.trim()) {
    return { error: "Title and body are required." };
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
    console.error("Create Question Error:", err);
    return { error: "Failed to post your question. Please try again." };
  }
}

/**
 * 2. Posts an Answer to an existing Question
 */
export async function createAnswer(payload: CreateAnswerPayload) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    return { error: "You must be logged in to post an answer." };
  }

  if (!payload.body.trim()) {
    return { error: "Answer body cannot be empty." };
  }

  try {
    await prisma.communityAnswer.create({
      data: {
        body: payload.body,
        authorId: authUser.id,
        questionId: payload.questionId,
      },
    });

    revalidatePath(`/community/${payload.questionId}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Create Answer Error:", err);
    return { error: "Failed to post your answer. Please try again." };
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
    return { error: "Unauthorized access." };
  }

  // Verify the user owns the question
  const question = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    select: { authorId: true, isResolved: true },
  });

  if (!question) return { error: "Question not found." };
  if (question.authorId !== authUser.id) return { error: "Only the author can accept an answer." };
  if (question.isResolved) return { error: "This question is already resolved." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.communityAnswer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      });

      await tx.communityQuestion.update({
        where: { id: questionId },
        data: { isResolved: true },
      });
    });

    revalidatePath(`/community/${questionId}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Accept Answer Error:", err);
    return { error: "Failed to accept the answer. Please try again." };
  }
}
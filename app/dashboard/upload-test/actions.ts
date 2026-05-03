// app/dashboard/upload-test/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EducationLevel } from "@prisma/client";

export interface CreateExamPayload {
  title: string;
  description: string;
  subjectId: string;
  level: string;
  type: string;
  duration: number | null;
  questions: {
    text: string;
    marks: number;
    explanation: string;
    options: { text: string; isCorrect: boolean }[];
  }[];
}

export async function createExamAction(data: CreateExamPayload) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    return { error: "Unauthorized. Please log in." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, isProfileComplete: true }
  });

  if (dbUser?.role !== "TUTOR" && dbUser?.role !== "RESEARCHER") {
    return { error: "Forbidden. Only verified creators can publish assessments." };
  }

  if (!dbUser.isProfileComplete) {
    return { error: "Please complete your profile onboarding before publishing." };
  }

  try {
    // 🔐 Prisma Nested Create Transaction
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description || null,
        level: data.level as EducationLevel,
        type: data.type,
        duration: data.duration,
        questionsCount: data.questions.length, // Cache the count
        isPublished: true, 
        subjectId: data.subjectId,
        authorId: authUser.id,
        
        // Deep nested insert for questions and options
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            marks: q.marks,
            explanation: q.explanation || null,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      }
    });

    revalidatePath("/tests");
    revalidatePath("/dashboard");

    return { success: true, examId: exam.id };

  } catch (dbError: unknown) {
    console.error("Database Error creating exam:", dbError);
    if (dbError instanceof Error) {
      return { error: `Database error: ${dbError.message}` };
    }
    return { error: "An unexpected database error occurred." };
  }
}
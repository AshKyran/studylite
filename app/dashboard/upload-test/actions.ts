"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EducationLevel } from "@prisma/client";


// Types mirroring our form state
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

  if (error || !authUser) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true }
  });

  if (dbUser?.role !== "TUTOR" && dbUser?.role !== "RESEARCHER") {
    throw new Error("Only verified creators can publish assessments.");
  }

  try {
    // Prisma Nested Create Transaction
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

    // Refresh the Test Hub pages so the new exam shows up instantly
    revalidatePath("/explore/tests");
    revalidatePath("/explore/tests/generator");

    return { success: true, examId: exam.id };

  } catch (dbError) {
    console.error("Database Error creating exam:", dbError);
    throw new Error("Failed to save the assessment to the database.");
  }
}
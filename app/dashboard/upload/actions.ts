// app/dashboard/upload/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function createNoteRecord(data: {
  title: string;
  description: string;
  price: number;
  level: "HIGH_SCHOOL" | "COLLEGE" | "GENERAL";
  subjectId: string;
  contentUrl: string;
  thumbnailUrl: string | null;
}) {
  // 1. SECURITY: Fetch user session securely on the server
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized. Please log in." };
  }

  // 2. SECURITY: Verify Role and Onboarding status
  // Even if a Student somehow accesses this action, they will be blocked here.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isProfileComplete: true }
  });

  if (!dbUser || dbUser.role === "STUDENT" || !dbUser.isProfileComplete) {
    return { error: "Forbidden. Only verified tutors and researchers can publish materials." };
  }

  if (data.price < 0) {
    return { error: "Price cannot be a negative value." };
  }

  try {
    const newNote = await prisma.note.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price, // Prisma safely handles Number to Decimal conversion here
        level: data.level,
        subjectId: data.subjectId,
        authorId: user.id, // 🔐 Strictly bound to the authenticated server session
        contentUrl: data.contentUrl,
        thumbnailUrl: data.thumbnailUrl,
        isPublished: true, 
      },
    });

    return { success: true, noteId: newNote.id };
  } catch (error) {
    console.error("Failed to insert note into DB:", error);
    return { error: "Database error. Failed to save product details." };
  }
}
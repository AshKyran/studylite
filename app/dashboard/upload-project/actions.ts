// app/dashboard/upload-project/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma"; // UPGRADE: Secure centralized connection pool
import { revalidatePath } from "next/cache";

interface CreateProjectPayload {
  title: string;
  description: string;
  price: number;
  subjectId: string;
  level: "HIGH_SCHOOL" | "COLLEGE" | "GENERAL"; 
  demoUrl?: string;
  techStack: string[];
  documentUrl: string | null;
  sourceCodeUrl: string | null;
}

export async function createProjectAction(data: CreateProjectPayload) {
  // 1. Secure Authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: You must be logged in to upload projects." };
  }

  // 2. Strict Authorization Guard
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isProfileComplete: true }
  });

  if (!dbUser || dbUser.role === "STUDENT" || !dbUser.isProfileComplete) {
    return { error: "Forbidden. Only verified creators can publish projects." };
  }

  if (data.price < 0) return { error: "Price cannot be a negative value." };

  try {
    // 3. Write securely to the database
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        subjectId: data.subjectId,
        level: data.level, 
        demoUrl: data.demoUrl || null,
        techStack: data.techStack,
        documentUrl: data.documentUrl,
        sourceCodeUrl: data.sourceCodeUrl,
        authorId: user.id, // Strictly bound to the verified server session
        isPublished: true, 
      },
    });

    // 4. Bust cache so it appears on storefront
    revalidatePath("/explore");
    revalidatePath("/dashboard");

    return { success: true, projectId: project.id };
    
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to create project record in the database." };
  }
}
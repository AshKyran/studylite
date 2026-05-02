"use server";

import { createClient } from "@/utils/supabase/server";
import { PrismaClient, EducationLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. Strict TypeScript interface for the incoming data payload
interface CreateProjectPayload {
  title: string;
  description: string;
  price: number;
  subjectId: string;
  level: string; 
  demoUrl?: string;
  techStack: string[];
  documentUrl: string | null;
  sourceCodeUrl: string | null;
}

export async function createProjectAction(data: CreateProjectPayload) {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error("Unauthorized: You must be logged in to upload projects.");
  }

  // 2. Validate Education Level to satisfy Prisma's Enum requirements safely
  const validLevels = ["HIGH_SCHOOL", "COLLEGE", "GENERAL"];
  if (!validLevels.includes(data.level)) {
    throw new Error("Invalid education level provided.");
  }

  try {
    // 3. Write securely to the database
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        subjectId: data.subjectId,
        level: data.level as EducationLevel, // Safe cast after validation
        demoUrl: data.demoUrl || null,
        techStack: data.techStack,
        documentUrl: data.documentUrl,
        sourceCodeUrl: data.sourceCodeUrl,
        authorId: authUser.id,
        isPublished: true, // Instantly available on the storefront
      },
    });

    // 4. Bust the Next.js cache so the new project appears immediately
    revalidatePath("/explore/projects");
    revalidatePath("/dashboard");

    return { success: true, projectId: project.id };
    
  } catch (error) {
    // Strict error handling
    console.error("Database Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create project record";
    throw new Error(message);
  }
}
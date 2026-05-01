"use server";

import { createClient } from "@/utils/supabase/server"; // Your Supabase SSR utility
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "STUDENT" | "TUTOR" | "RESEARCHER";

  const supabase = await createClient();

  // 1. Register the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "An unexpected error occurred during signup." };
  }

  try {
    // 2. Sync the Supabase Auth User with your Prisma Public Profile 
    await prisma.user.create({
      data: {
        id: authData.user.id, // CRITICAL: Links Prisma to Supabase [cite: 10]
        email: authData.user.email!,
        firstName,
        lastName,
        role, 
      },
    });
  } catch (dbError) {
    console.error("Database sync error:", dbError);
    // Note: In a fully strict production environment, you might want to implement a 
    // rollback strategy here or handle this via Supabase Webhooks.
    return { error: "Account created, but profile setup failed. Please contact support." };
  }

  // 3. Redirect on success
  redirect("/login?registered=true");
}
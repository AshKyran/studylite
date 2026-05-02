"use server";

import { createClient } from "@/utils/supabase/server"; //[cite: 12]
// FIX 1: Import your global Prisma client to prevent connection exhaustion
import prisma from "@/lib/prisma"; 
import { redirect } from "next/navigation"; //[cite: 12]

export async function registerUser(formData: FormData) { //[cite: 12]
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // FIX 2: Strict Runtime Role Validation
  const rawRole = formData.get("role") as string;
  const allowedRoles = ["STUDENT", "TUTOR", "RESEARCHER"];
  // Fallback to STUDENT if someone tries to inject an invalid/admin role
  const role = allowedRoles.includes(rawRole) ? rawRole : "STUDENT";

  const supabase = await createClient(); //[cite: 12]

  // 1. Register the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({ //[cite: 12]
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
    return { error: authError.message }; //[cite: 12]
  }

  if (!authData.user) {
    return { error: "An unexpected error occurred during signup." }; //[cite: 12]
  }

  try {
    // 2. Sync the Supabase Auth User with your Prisma Public Profile 
    await prisma.user.create({
      data: {
        id: authData.user.id, // CRITICAL: Links Prisma to Supabase[cite: 12]
        email: authData.user.email!,
        firstName,
        lastName,
        role: role as "STUDENT" | "TUTOR" | "RESEARCHER", 
      },
    });
  } catch (dbError) {
    console.error("Database sync error:", dbError); //[cite: 12]
    
    // FIX 3: Rollback Strategy
    // If the database fails, we delete the auth user so they aren't stuck in limbo.
    // Note: requires the Supabase Service Role Key to bypass RLS, or you can use the standard admin client if configured.
    await supabase.auth.admin.deleteUser(authData.user.id);
    
    return { error: "Account created, but profile setup failed. Please try again." }; //[cite: 12]
  }

  // 3. Redirect on success
  redirect("/login?registered=true"); //[cite: 12]
}
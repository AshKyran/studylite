"use server";

import { createClient } from "@/utils/supabase/server"; 
import prisma from "@/lib/prisma"; 
import { redirect } from "next/navigation"; 

export async function registerUser(formData: FormData) { 
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // Strict Runtime Role Validation
  const rawRole = formData.get("role") as string;
  const allowedRoles = ["STUDENT", "TUTOR", "RESEARCHER"];
  // Fallback to STUDENT if someone tries to inject an invalid/admin role
  const role = allowedRoles.includes(rawRole) ? rawRole : "STUDENT";

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
        id: authData.user.id, // CRITICAL: Links Prisma to Supabase
        email: authData.user.email!,
        firstName,
        lastName,
        role: role as "STUDENT" | "TUTOR" | "RESEARCHER", 
      },
    });
  } catch (dbError) {
    console.error("Database sync error:", dbError); 
    
    // Rollback Strategy
    // If the database fails, we delete the auth user so they aren't stuck in limbo.
    await supabase.auth.admin.deleteUser(authData.user.id);
    
    return { error: "Account created, but profile setup failed. Please try again." }; 
  }

  // 3. Redirect on success
  redirect("/login?registered=true"); 
}

// ==========================================
// ADDED THIS FUNCTION SO THE PAGE CAN FIND IT
// ==========================================
export async function loginWithGoogle() {
  const supabase = await createClient();
  
  // Ensure this environment variable is set in your .env
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

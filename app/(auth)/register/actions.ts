// app/(auth)/register/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server"; 
import prisma from "@/lib/prisma"; 
import { redirect } from "next/navigation"; 
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"; // UPGRADE: Import standard client for Admin actions

export async function registerUser(formData: FormData) { 
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const rawRole = formData.get("role") as string;
  const allowedRoles = ["STUDENT", "TUTOR", "RESEARCHER"];
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
        id: authData.user.id, 
        email: authData.user.email!,
        firstName,
        lastName,
        role: role as "STUDENT" | "TUTOR" | "RESEARCHER", 
      },
    });
  } catch (dbError) {
    console.error("🚨 Database sync error:", dbError); 
    
    // UPGRADE: Secure Rollback Strategy using the Service Role Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createSupabaseAdmin(supabaseUrl, supabaseServiceKey);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    } else {
      console.error("🚨 FATAL: Missing SUPABASE_SERVICE_ROLE_KEY. Could not rollback user.");
    }
    
    return { error: "Account created, but profile setup failed. Please try again." }; 
  }

  // 3. Redirect on success
  redirect("/login?registered=true"); 
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("🚨 FATAL: NEXT_PUBLIC_SITE_URL is not set.");
  }

  const redirectUrl = `${siteUrl}/auth/callback`;

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
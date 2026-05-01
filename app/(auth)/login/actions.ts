"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// 1. Standard Email/Password Login
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase automatically sets the cookies, so we just redirect
  redirect("/dashboard");
}

// 2. Google OAuth Login
export async function loginWithGoogle() {
  const supabase = await createClient();
  
  
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect the user to the Google consent screen
  if (data.url) {
    redirect(data.url);
  }
}
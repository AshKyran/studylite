// app/actions/auth.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) throw new Error("Email is required");

  const supabase = await createClient();
  
  // Sends the email with a secure token. 
  // It redirects to our callback route which will then forward them to the update page.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) throw new Error("Passwords do not match");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const supabase = await createClient();
  
  // Updates the password for the currently authenticated user
  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw new Error(error.message);
  
  redirect("/dashboard?success=password_updated");
}
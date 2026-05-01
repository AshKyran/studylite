// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma securely
const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Extract the URL parameters that Google/Supabase sent back
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // If there's a specific page they were trying to access before logging in,
  // we capture it here. Otherwise, default to dashboard.
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    // Securely exchange the temporary code for a valid user session
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (!authError && authData.user) {
      const user = authData.user;

      try {
        // CRITICAL: Check if this user already exists in your Prisma database
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        // If they do NOT exist, it means this is their first time logging in via Google.
        // We must create their profile so your dashboard doesn't crash.
        if (!existingUser) {
          // Extract names from Google's metadata payload safely
          const fullName = user.user_metadata?.full_name || "";
          const nameParts = fullName.split(" ");
          const firstName = user.user_metadata?.first_name || nameParts[0] || "Student";
          const lastName = user.user_metadata?.last_name || nameParts.slice(1).join(" ") || "";

          await prisma.user.create({
            data: {
              id: user.id, // Linking Prisma ID exactly to Supabase ID
              email: user.email!,
              firstName: firstName,
              lastName: lastName,
              role: "STUDENT", // Default to STUDENT for Google OAuth users
              isVerified: false,
            },
          });
        }

        // Successfully authenticated and synced. Redirect to the app.
        return NextResponse.redirect(`${origin}${next}`);

      } catch (dbError) {
        console.error("Database sync error during OAuth:", dbError);
        return NextResponse.redirect(`${origin}/login?error=Failed to sync user profile.`);
      }
    }
  }

  // If there was no code, or the exchange failed, kick them back to login with an error
  return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
}
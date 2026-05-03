// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
// UPGRADE: Import your centralized Prisma client to prevent connection leaks
import prisma from "@/lib/prisma"; 

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // createClient() now strictly checks for missing env variables based on our previous upgrades
    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!authError && authData.user) {
      const user = authData.user;

      try {
        // Sync the Supabase user to our Prisma database
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (!existingUser) {
          const fullName = user.user_metadata?.full_name || "";
          const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

          const firstName =
            user.user_metadata?.first_name || nameParts[0] || "Student";

          const lastName =
            user.user_metadata?.last_name || nameParts.slice(1).join(" ") || "";

          // The exclamation mark here is safe because Google OAuth guarantees an email
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!, 
              firstName,
              lastName,
              role: "STUDENT",
              isVerified: false,
            },
          });
        }

        // Successfully authenticated and synced; redirect to the intended destination
        return NextResponse.redirect(new URL(next, origin));
        
      } catch (dbError) {
        console.error("🚨 Database sync error during OAuth:", dbError);
        return NextResponse.redirect(
          new URL("/login?error=Failed%20to%20sync%20user%20profile.", origin)
        );
      }
    } else if (authError) {
        console.error("🚨 Supabase OAuth exchange error:", authError);
    }
  }

  // Fallback for missing code or failed authentication
  return NextResponse.redirect(
    new URL("/login?error=Authentication%20failed.%20Please%20try%20again.", origin)
  );
}
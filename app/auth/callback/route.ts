// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!authError && authData.user) {
      const user = authData.user;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (!existingUser) {
          const fullName = user.user_metadata?.full_name || "";
          const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

          const firstName =
            user.user_metadata?.first_name ||
            nameParts[0] ||
            "Student";

          const lastName =
            user.user_metadata?.last_name ||
            nameParts.slice(1).join(" ") ||
            "";

          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email ?? "",
              firstName,
              lastName,
              role: "STUDENT",
              isVerified: false,
            },
          });
        }

        return NextResponse.redirect(new URL(next, origin));
      } catch (dbError) {
        console.error("Database sync error during OAuth:", dbError);
        return NextResponse.redirect(
          new URL("/login?error=Failed%20to%20sync%20user%20profile.", origin)
        );
      }
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=Authentication%20failed.%20Please%20try%20again.", origin)
  );
}
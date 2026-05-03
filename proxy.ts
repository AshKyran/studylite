import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 FATAL: Supabase environment variables are missing in proxy.");
    // In middleware, throwing an error might crash the edge worker poorly.
    // It's safer to redirect to an error page or return a 500 response.
    return new NextResponse("Internal Server Error: Missing Database Config", { status: 500 });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 2. Protect specific routes (e.g., everything inside /dashboard)
  if (user && pathname.startsWith("/dashboard") && !pathname.includes("/pricing")) {
    
    // ⚠️ PERFORMANCE WARNING: Querying the DB in Edge middleware adds latency to every request.
    // Consider moving this check to app/dashboard/layout.tsx if the dashboard feels slow.
    const { data: dbUser } = await supabase
      .from('User') // Must match your DB table exactly
      .select('isSubscribed, trialEndsAt, subscriptionPlan')
      .eq('id', user.id)
      .single();

    if (dbUser) {
      const now = new Date();
      const trialEndsAt = dbUser.trialEndsAt ? new Date(dbUser.trialEndsAt) : null;
      
      const isTrialExpired = trialEndsAt && trialEndsAt < now;
      const isPaidSub = dbUser.isSubscribed && dbUser.subscriptionPlan !== "TRIAL_7_DAY";

      // 3. THE BLOCKER: If trial is expired and they haven't paid, kick them to pricing
      if (isTrialExpired && !isPaidSub) {
        const url = request.nextUrl.clone();
        url.pathname = "/pricing";
        url.searchParams.set("alert", "trial_expired");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

// Ensure your config exported in middleware.ts ignores static files and images
// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
// };
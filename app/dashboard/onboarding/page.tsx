import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

const prisma = new PrismaClient();

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isProfileComplete: true, role: true }
  });

  // Security checks
  if (!dbUser) redirect("/login");
  
  // If they aren't a creator, they don't need this routing page
  if (dbUser.role === "STUDENT") redirect("/dashboard");
  
  // If they ALREADY completed this, lock them out!
  if (dbUser.isProfileComplete) redirect("/dashboard");

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🎓</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Your Creator Profile</h1>
          <p className="mt-2 text-slate-600 font-medium">
            Before you can sell materials, we need your academic credentials and payout details. 
            <strong className="text-red-500 block mt-1">Warning: These details cannot be changed once submitted.</strong>
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
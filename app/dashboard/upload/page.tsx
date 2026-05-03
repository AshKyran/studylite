import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadNoteForm from "./UploadNoteForm"; 

export default async function UploadPage() {
  // 1. Secure Authentication via Supabase
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  // 2. Fetch User Role & Onboarding Status from Prisma
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, role: true, isProfileComplete: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // 3. Strict Authorization Guards
  if (dbUser.role === "STUDENT") {
    // Students cannot upload materials for sale
    redirect("/dashboard");
  }

  if (!dbUser.isProfileComplete) {
    // SECURITY WALL: Creators MUST complete KYC & Paystack routing before uploading
    redirect("/dashboard/onboarding");
  }

  // 4. Fetch categories securely for the dropdown
  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }, // Alphabetical order
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload Study Material</h1>
          <p className="mt-2 text-slate-600 font-medium">
            Share your knowledge. Your 97.5% revenue cut will be routed automatically to your settlement account upon every sale.
          </p>
        </div>

        <UploadNoteForm subjects={subjects} userId={dbUser.id} />
        
      </div>
    </div>
  );
}
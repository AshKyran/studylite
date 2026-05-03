import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadProjectForm from "./UploadProjectForm"; // We will build this next


export default async function UploadProjectPage() {
  // 1. Secure Authentication via Supabase
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  // 2. Fetch User Role & Onboarding Status
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, isProfileComplete: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // 3. Strict Authorization Guards
  // Only Tutors, Researchers, and Admins can upload premium projects
  if (dbUser.role === "STUDENT") {
    redirect("/dashboard");
  }

  // SECURITY WALL: Creators MUST complete KYC & Paystack routing before uploading
  if (!dbUser.isProfileComplete) {
    redirect("/dashboard/onboarding");
  }

  // 4. Fetch categories securely for the dropdown
  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }, // Alphabetical order
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Upload Advanced Project
          </h1>
          <p className="mt-2 text-slate-600 font-medium">
            Publish comprehensive capstones, full-stack codebases, and research theses. You keep 97.5% of every sale.
          </p>
        </div>

        {/* The Interactive Form Component */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <UploadProjectForm subjects={subjects} />
        </div>

      </div>
    </div>
  );
}
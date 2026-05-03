// app/dashboard/upload/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadNoteForm from "./UploadNoteForm"; 
import { UploadCloud } from "lucide-react";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, role: true, isProfileComplete: true },
  });

  if (!dbUser || dbUser.role === "STUDENT") {
    redirect("/dashboard");
  }

  if (!dbUser.isProfileComplete) {
    redirect("/dashboard/onboarding");
  }

  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }, 
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <UploadCloud className="w-8 h-8 text-indigo-600" />
          Upload Study Material
        </h1>
        <p className="mt-2 text-slate-500 font-medium">
          Share your expertise. Upload your notes, summaries, or research papers and set your price.
        </p>
      </div>

      <UploadNoteForm subjects={subjects} />
    </div>
  );
}
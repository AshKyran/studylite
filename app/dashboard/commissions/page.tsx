import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CommissionsBoard from "./CommissionsBoard"; 


export default async function CommissionsPage() {
  // 1. Strict Authentication
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true }
  });

  // SECURITY: Only Tutors and Researchers have a commissions board
  if (dbUser?.role !== "TUTOR" && dbUser?.role !== "RESEARCHER") {
    redirect("/dashboard?error=unauthorized_creator");
  }

  // 2. Fetch all requests assigned to this specific tutor
  const requests = await prisma.materialRequest.findMany({
    where: { tutorId: authUser.id },
    include: {
      student: {
        select: { firstName: true, lastName: true } // Fetch student name to show who requested it
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Active Commissions
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Manage custom material requests from students. Deliver high-quality PDFs and ZIPs to release your escrow payouts.
          </p>
        </div>

        {/* Pass the data to the interactive client board */}
        <CommissionsBoard initialRequests={requests} />
        
      </div>
    </div>
  );
}
// app/dashboard/commissions/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CommissionsBoard from "./CommissionsBoard"; 

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true }
  });

  if (dbUser?.role !== "TUTOR" && dbUser?.role !== "RESEARCHER") {
    redirect("/dashboard?error=unauthorized_creator");
  }

  const requests = await prisma.materialRequest.findMany({
    where: { tutorId: authUser.id },
    include: {
      student: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // UPGRADE: Serialize the Prisma Decimals to Numbers before passing to the Client Component
  const serializedRequests = requests.map(req => ({
    ...req,
    offerAmount: Number(req.offerAmount)
  }));

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Active Commissions
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Manage custom material requests from students. Deliver high-quality PDFs and ZIPs to release your escrow payments.
          </p>
        </div>
        
        <CommissionsBoard initialRequests={serializedRequests} />
      </div>
    </div>
  );
}
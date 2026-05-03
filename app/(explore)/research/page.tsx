// app/(explore)/research/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Microscope, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  LockKeyhole,
  Library
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResearchHubPage() {
  // 1. Authentication & Gatekeeper Logic
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirect=/research");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true }
  });

  // THE STRICT GATEKEEPER: Kick out free and 7-Day Trial users
  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=research");
  }

  // 2. Fetch all published research materials
  const dbPapers = await prisma.note.findMany({
    where: { isPublished: true },
    include: {
      author: {
        select: { firstName: true, lastName: true, qualification: true },
      },
      subject: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // UPGRADE: Safely serialize any Decimals just in case they are referenced later
  const papers = dbPapers.map(paper => ({
    ...paper,
    price: Number(paper.price)
  }));

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 p-4 sm:p-6 md:p-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Premium Hero Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative border border-slate-800">
          {/* Aesthetic glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
                  <Microscope className="w-6 h-6" />
                </div>
                <span className="text-purple-400 font-bold uppercase tracking-wider text-sm flex items-center gap-1.5">
                  <LockKeyhole className="w-4 h-4" /> Subscriber Exclusive
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Advanced Research Hub
              </h1>
              <p className="text-lg text-slate-300 font-medium">
                Unrestricted access to comprehensive thesis reviews, post-grad publications, and specialized academic research.
              </p>
            </div>
          </div>
        </div>

        {/* Research Grid */}
        {papers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {papers.map((paper) => (
              <Link 
                href={`/${paper.id}`} // Routes to the main explore ID page
                key={paper.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col group overflow-hidden"
              >
                {/* Minimalist Academic Header */}
                <div className="h-32 bg-slate-50 p-5 flex flex-col justify-between border-b border-slate-100 relative overflow-hidden">
                  <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200/50 group-hover:scale-110 transition-transform duration-500" />
                  <div className="relative z-10 flex items-start justify-between">
                    <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {paper.subject.name}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-purple-600 transition-colors line-clamp-3">
                    {paper.title}
                  </h3>

                  {/* Author Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-inner">
                        {paper.author.firstName[0]}{paper.author.lastName[0]}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                          {paper.author.firstName} {paper.author.lastName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate flex items-center gap-1 mt-0.5">
                          {paper.author.qualification || "Researcher"}
                          {paper.author.qualification && <CheckCircle2 className="w-3 h-3 text-purple-500" />}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-purple-600 bg-purple-50 p-2 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Library className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No publications available</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Our verified researchers are currently peer-reviewing new materials. Check back soon.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
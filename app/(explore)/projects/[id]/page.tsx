// app/(explore)/projects/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { initializeProjectCheckout } from "./actions";
import { 
  ChevronLeft, 
  Code2, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Lock, 
  Unlock, 
  ShoppingCart,
  Database
} from "lucide-react";

export const dynamic = "force-dynamic";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  // UPGRADE: Await params for Next.js 15 compatibility
  const resolvedParams = await props.params;
  const projectId = resolvedParams.id;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 1. Fetch Project Details
  const project = await prisma.project.findUnique({
    where: { id: projectId, isPublished: true },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, qualification: true },
      },
      subject: {
        select: { name: true },
      },
    },
  });

  if (!project) return notFound();

  // UPGRADE: Serialize Prisma Decimal
  const priceAsNumber = Number(project.price);

  // 2. Determine Access Rights (Free vs Paid vs Owned)
  let hasAccess = false;
  
  if (priceAsNumber === 0) {
    hasAccess = true; 
  } else if (authUser) {
    if (project.authorId === authUser.id) {
      hasAccess = true; 
    } else {
      // Check the ledger to see if they bought it
      const dbUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: {
          purchasedProjects: { 
            where: { id: projectId },
            select: { id: true }
          }
        }
      });
      if (dbUser && dbUser.purchasedProjects && dbUser.purchasedProjects.length > 0) {
        hasAccess = true;
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
      
      {/* Back Button */}
      <Link href="/explore/projects" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group">
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Projects Hub
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                {project.subject.name}
              </span>
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-slate-700">
                {project.level.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6 relative z-10">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
              {project.techStack.map((tech, index) => (
                <span key={index} className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {tech}
                </span>
              ))}
            </div>
            
            <p className="text-slate-400 font-medium leading-relaxed relative z-10 text-lg">
              {project.description}
            </p>
          </div>
        </div>

        {/* Purchase Sidebar (Right) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            {/* Payment & Access Card */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2 relative z-10">Project License</p>
              <p className="text-4xl font-black mb-8 relative z-10 text-blue-400">
                {priceAsNumber === 0 ? "FREE" : formatCurrency(priceAsNumber)}
              </p>

              {hasAccess ? (
                <Link href="/dashboard/library" className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-base font-black text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-[0.98] relative z-10 shadow-lg">
                  <Unlock className="w-5 h-5" /> Access Project Files
                </Link>
              ) : (
                <form action={initializeProjectCheckout} className="relative z-10">
                  <input type="hidden" name="projectId" value={project.id} />
                  <button type="submit" className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-base font-black text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-[0.98]">
                    <ShoppingCart className="w-5 h-5" /> Unlock Code & Data
                  </button>
                  <p className="mt-4 text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Secured by Paystack • Instant Delivery
                  </p>
                </form>
              )}

              {/* What's Included */}
              <div className="mt-8 pt-8 border-t border-slate-800 relative z-10">
                <p className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Includes</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <div className={`p-1.5 rounded-md ${project.documentUrl ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-600"}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    {project.documentUrl ? "Full Technical Report" : <span className="line-through">No Technical Report</span>}
                  </li>
                  <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <div className={`p-1.5 rounded-md ${project.sourceCodeUrl ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"}`}>
                      <Code2 className="w-4 h-4" />
                    </div>
                    {project.sourceCodeUrl ? "Complete Source Code" : <span className="line-through">No Source Code</span>}
                  </li>
                  {project.demoUrl && (
                    <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Live Demo Link Available
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Developer Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg font-black border border-blue-100 shrink-0">
                {project.author.firstName[0]}{project.author.lastName[0]}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Developer</p>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  {project.author.firstName} {project.author.lastName}
                  {project.author.qualification && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
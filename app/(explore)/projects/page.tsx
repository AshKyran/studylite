// app/(explore)/projects/page.tsx
import Link from "next/link";
import prisma from "@/lib/prisma";
import { 
  Rocket, 
  Code2, 
  CheckCircle2, 
  Database
} from "lucide-react";

export const dynamic = "force-dynamic";

// Helper function to format KES currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default async function ProjectsHubPage() {
  // 1. Fetch all published projects from the database
  const dbProjects = await prisma.project.findMany({
    where: { isPublished: true },
    include: {
      author: {
        select: { firstName: true, lastName: true, qualification: true },
      },
      subject: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 2. UPGRADE: Securely serialize Prisma Decimals to JavaScript Numbers
  const projects = dbProjects.map(project => ({
    ...project,
    price: Number(project.price)
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
              <Rocket className="w-10 h-10 md:w-12 md:h-12 text-blue-500 shrink-0" />
              Advanced Projects Hub
            </h1>
            <p className="text-lg text-slate-300 font-medium">
              Browse premium final-year capstones, full-stack codebases, and comprehensive research data. Buy the complete documentation and source code securely.
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link 
                href={`/projects/${project.id}`} 
                key={project.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col group overflow-hidden"
              >
                {/* Visual Header (Dark Theme for Projects) */}
                <div className="h-48 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Code2 className="w-32 h-32 text-blue-500" />
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                      {project.subject.name}
                    </span>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {project.level.replace("_", " ")}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 relative z-10 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.techStack.slice(0, 4).map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">
                          +{project.techStack.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto"></div>
                </div>

                {/* Card Footer (Author & Price) */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Developer / Author</p>
                    <p className="text-sm font-black text-slate-900 truncate max-w-37.5 flex items-center gap-1.5">
                      {project.author.firstName} {project.author.lastName}
                      {project.author.qualification && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-lg font-black text-emerald-600">
                      {project.price === 0 ? "FREE" : formatCurrency(project.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Database className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No projects available</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Our verified creators are currently building more advanced projects. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
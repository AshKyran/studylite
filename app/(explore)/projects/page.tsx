
import Link from "next/link";
import prisma from "@/lib/prisma";

// Helper function to format KES currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default async function ProjectsHubPage() {
  // Fetch all published projects from the database
  const projects = await prisma.project.findMany({
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Advanced Projects Hub
            </h1>
            <p className="text-lg text-slate-300 font-medium">
              Browse premium final-year capstones, full-stack codebases, and comprehensive research data. Buy the report, download the code, and accelerate your learning.
            </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <span className="text-4xl mb-4 block">🚀</span>
            <h3 className="text-xl font-bold text-slate-900">No projects listed yet</h3>
            <p className="text-slate-500 mt-2">Check back soon for premium codebases and theses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link href={`/explore/projects/${project.id}`} key={project.id} className="group">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  
                  {/* Card Header (Subject & Demo Link) */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                      {project.subject.name}
                    </span>
                    {project.demoUrl && (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Demo
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 mb-6 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tech Stack Tags */}
                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.slice(0, 4).map((tech, index) => (
                          <span key={index} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-xs font-bold rounded-md">
                            +{project.techStack.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Spacer to push footer to bottom */}
                    <div className="mt-auto"></div>
                  </div>

                  {/* Card Footer (Author & Price) */}
                  <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Developer / Author</p>
                      <p className="text-sm font-bold truncate max-w-37.5">
                        {project.author.firstName} {project.author.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Price</p>
                      <p className="text-lg font-black text-emerald-400">
                        {project.price === 0 ? "Free" : formatCurrency(project.price)}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { initializeProjectCheckout } from "./actions";


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 1. Fetch Project Details
  const project = await prisma.project.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      author: {
        select: { firstName: true, lastName: true, qualification: true },
      },
      subject: {
        select: { name: true },
      },
    },
  });

  if (!project) return notFound();

  // 2. Determine Access Rights (Free vs Paid vs Owned)
  let hasAccess = false;
  
  if (project.price === 0) {
    hasAccess = true; // Free projects are accessible to everyone
  } else if (authUser) {
    if (project.authorId === authUser.id) {
      hasAccess = true; // Authors always own their own work
    } else {
      // Check the ledger to see if they bought it
      const existingPurchase = await prisma.purchase.findFirst({
        where: { userId: authUser.id, projectId: project.id },
      });
      if (existingPurchase) hasAccess = true;
    }
  }

  // 3. Generate Secure Signed URLs (if they have access)
  let secureDocumentUrl = null;
  let secureSourceCodeUrl = null;

  if (hasAccess && authUser) {
    // Generate 1-hour expiring links from your Supabase storage bucket
    if (project.documentUrl) {
      const { data } = await supabase.storage
        .from("product_files")
        .createSignedUrl(project.documentUrl, 3600);
      secureDocumentUrl = data?.signedUrl;
    }
    if (project.sourceCodeUrl) {
      const { data } = await supabase.storage
        .from("product_files")
        .createSignedUrl(project.sourceCodeUrl, 3600);
      secureSourceCodeUrl = data?.signedUrl;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Navigation */}
        <Link href="/explore/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Projects Hub
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
                  {project.subject.name}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider">
                  {project.level.replace("_", " ")}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                {project.title}
              </h1>

              {/* Tech Stack Pills */}
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-4 py-6 border-t border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {project.author.firstName[0]}{project.author.lastName[0]}
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-0.5">Developed By</p>
                  <p className="font-bold text-slate-900">
                    {project.author.firstName} {project.author.lastName}
                    {project.author.qualification && (
                      <span className="text-slate-400 font-medium ml-1">
                        ({project.author.qualification})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Project Overview</h3>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                {project.description}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl sticky top-8">
              
              <div className="mb-8">
                <p className="text-slate-400 text-sm font-medium mb-2">Total Price</p>
                <p className="text-4xl font-black text-emerald-400">
                  {project.price === 0 ? "Free Access" : formatCurrency(project.price)}
                </p>
              </div>

              {/* DYNAMIC ACTION AREA: Download vs Buy */}
              {hasAccess ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-center">
                    <p className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Files Unlocked
                    </p>
                  </div>
                  
                  {/* File Download Buttons */}
                  {!authUser ? (
                    <Link href="/login" className="block w-full py-3 bg-white text-slate-900 text-center rounded-xl font-bold transition-colors">
                      Log in to Download Files
                    </Link>
                  ) : (
                    <>
                      {secureDocumentUrl && (
                        <a href={secureDocumentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          View Report / Thesis (PDF)
                        </a>
                      )}
                      
                      {secureSourceCodeUrl && (
                        <a href={secureSourceCodeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors mt-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          Download Source Code (.zip)
                        </a>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <form action={async () => {
                  "use server";
                  if (!authUser) redirect("/login");
                  await initializeProjectCheckout(project.id);
                }}>
                  <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Secure Checkout
                  </button>
                  <p className="text-center text-slate-500 text-xs font-medium mt-4">
                    Secured by Paystack • Instant Delivery
                  </p>
                </form>
              )}

              {/* What's Included */}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Includes</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className={project.documentUrl ? "text-blue-400" : "text-slate-600"}>✓</span>
                    Full Technical Report
                  </li>
                  <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className={project.sourceCodeUrl ? "text-emerald-400" : "text-slate-600"}>✓</span>
                    Complete Source Code
                  </li>
                  {project.demoUrl && (
                    <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <span className="text-purple-400">✓</span>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-slate-700 underline-offset-4">
                        Live Demo Link
                      </a>
                    </li>
                  )}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
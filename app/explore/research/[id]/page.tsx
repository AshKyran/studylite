import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ResearchReaderPage({
  params,
}: {
  params: { id: string };
}) {
  // 1. Authentication & Gatekeeper Logic
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirect=/explore/research/${params.id}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true }
  });

  // THE STRICT GATEKEEPER: Free users and 7-Day Trial users are kicked out!
  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=research");
  }

  // 2. Fetch the Research Paper (Using the Project model)
  const paper = await prisma.project.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      author: {
        select: { firstName: true, lastName: true, qualification: true, role: true, id: true },
      },
      subject: {
        select: { name: true },
      },
    },
  });

  if (!paper) notFound();

  // 3. Generate a highly secure, temporary 1-hour URL for the PDF
  let secureDocumentUrl = null;
  if (paper.documentUrl) {
    const { data } = await supabase.storage
      .from("product_files")
      .createSignedUrl(paper.documentUrl, 3600); // 1 hour expiry
    secureDocumentUrl = data?.signedUrl;
  }

  // Generate dynamic sections for the sidebar based on available data
  const sections = [
    { id: "abstract", title: "1. Abstract & Overview" },
    ...(paper.techStack.length > 0 ? [{ id: "methodology", title: "2. Technical Stack" }] : []),
    ...(secureDocumentUrl ? [{ id: "document", title: "3. Full Thesis PDF" }] : []),
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] bg-slate-50 font-sans">
      
      {/* PURE CSS MOBILE SIDEBAR TOGGLE 
        This hidden checkbox controls the sidebar without needing "use client" or React state!
      */}
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
      
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <span className="font-bold text-sm text-slate-900 truncate pr-4">Table of Contents</span>
        <label 
          htmlFor="sidebar-toggle"
          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>

      {/* Left Sidebar: Table of Contents */}
      <aside 
        className="hidden peer-checked:block lg:block w-full lg:w-72 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:sticky lg:top-0 lg:h-[calc(100vh-5rem)] overflow-y-auto"
      >
        <div className="p-6">
          <Link href="/explore/research" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Research Hub
          </Link>

          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
            Document Outline
          </h3>
          <nav className="flex flex-col gap-1.5">
            {sections.map((section, idx) => (
              <a 
                key={section.id}
                href={`#${section.id}`}
                className={`px-3 py-2.5 text-sm rounded-lg transition-colors font-medium ${
                  idx === 0 
                    ? "bg-blue-50 text-blue-700 font-bold" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="grow flex justify-center p-4 sm:p-8 lg:p-12 overflow-x-hidden">
        <article className="w-full max-w-4xl bg-white p-6 sm:p-10 lg:p-14 rounded-3xl shadow-sm border border-slate-200">
          
          {/* Article Header */}
          <header className="mb-10 pb-10 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider rounded-md">
                {paper.subject.name}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider rounded-md">
                Premium Research
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-8 leading-tight">
              {paper.title}
            </h1>
            
            {/* Author Meta Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-white font-bold text-xl">
                    {paper.author.firstName[0]}{paper.author.lastName[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {paper.author.firstName} {paper.author.lastName}
                    {paper.author.qualification && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {paper.author.qualification}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium capitalize">{paper.author.role.toLowerCase()}</p>
                </div>
              </div>
              
              {/* Dynamic Action Button */}
              {paper.author.role === "TUTOR" || paper.author.role === "RESEARCHER" ? (
                <Link 
                  href={`/tutors/${paper.authorId}`} 
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                >
                  Book for Tutoring
                </Link>
              ) : null}
            </div>
          </header>

          {/* Dynamic Content Rendering */}
          <div className="prose prose-slate prose-lg max-w-none text-slate-700">
            
            <h2 id="abstract" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
              Abstract & Overview
            </h2>
            <div className="whitespace-pre-wrap leading-relaxed mb-12 bg-white">
              {paper.description}
            </div>

            {paper.techStack.length > 0 && (
              <>
                <h2 id="methodology" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 mt-12 border-t border-slate-100 pt-12">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span>
                  Technical Stack
                </h2>
                <div className="flex flex-wrap gap-2 mb-12">
                  {paper.techStack.map((tech, idx) => (
                    <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl border border-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </>
            )}

            {secureDocumentUrl && (
              <>
                <h2 id="document" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 mt-12 border-t border-slate-100 pt-12">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">3</span>
                  Full Thesis Document
                </h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Securely loaded via encrypted viewer. Downloading or sharing is disabled to protect author IP.
                </p>
                
                {/* The Embedded Secure PDF Viewer */}
                <div className="w-full h-[80vh] min-h-200 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100 relative">
                  <iframe 
                    src={`${secureDocumentUrl}#toolbar=0`} 
                    className="absolute inset-0 w-full h-full border-0"
                    title={`${paper.title} Document`}
                  />
                </div>
              </>
            )}

          </div>
          
        </article>
      </main>

    </div>
  );
}
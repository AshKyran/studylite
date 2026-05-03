// app/(explore)/research/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Menu, 
  BookOpen, 
  Layers, 
  FileText, 
  CheckCircle2, 
  GraduationCap 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResearchReaderPage(props: { params: Promise<{ id: string }> }) {
  // UPGRADE: Await params for Next.js 15 compatibility
  const resolvedParams = await props.params;
  const paperId = resolvedParams.id;

  // 1. Strict Authentication & Error Handling
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect(`/login?redirect=/explore/research/${paperId}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true }
  });

  // THE STRICT GATEKEEPER: Free users and 7-Day Trial users are kicked out!
  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    redirect("/pricing?upgrade_required=research");
  }

  // 2. Fetch the Research Paper
  const paper = await prisma.project.findUnique({
    where: { id: paperId, isPublished: true },
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
    const { data, error: storageError } = await supabase.storage
      .from("product_files")
      .createSignedUrl(paper.documentUrl, 3600); // 1 hour expiry
    
    if (!storageError && data) {
      secureDocumentUrl = data.signedUrl;
    }
  }

  // Generate dynamic sections for the sidebar based on available data
  const sections = [
    { id: "abstract", title: "Abstract & Overview", icon: BookOpen },
    ...(paper.techStack.length > 0 ? [{ id: "methodology", title: "Technical Stack", icon: Layers }] : []),
    ...(secureDocumentUrl ? [{ id: "document", title: "Full Thesis PDF", icon: FileText }] : []),
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] bg-slate-50 font-sans">
      
      {/* PURE CSS MOBILE SIDEBAR TOGGLE */}
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
      
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <span className="font-bold text-sm text-slate-900 truncate pr-4">Table of Contents</span>
        <label 
          htmlFor="sidebar-toggle"
          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </label>
      </div>

      {/* Left Sidebar: Table of Contents */}
      <aside 
        className="hidden peer-checked:block lg:block w-full lg:w-80 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:sticky lg:top-0 lg:h-[calc(100vh-5rem)] overflow-y-auto"
      >
        <div className="p-6">
          <Link href="/explore/research" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors mb-8 group">
            <div className="p-1 rounded-md bg-slate-100 group-hover:bg-purple-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Back to Research Hub
          </Link>

          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">
            Document Outline
          </h3>
          <nav className="flex flex-col gap-2">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className={`flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all font-medium ${
                    idx === 0 
                      ? "bg-purple-50 text-purple-700 font-bold border border-purple-100" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${idx === 0 ? "text-purple-600" : "text-slate-400"}`} />
                  {section.title}
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="grow flex justify-center p-4 sm:p-8 lg:p-12 overflow-x-hidden">
        <article className="w-full max-w-4xl bg-white p-6 sm:p-10 lg:p-14 rounded-3xl shadow-sm border border-slate-200">
          
          {/* Article Header */}
          <header className="mb-12 pb-10 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                {paper.subject.name}
              </span>
              <span className="px-3 py-1 bg-slate-900 text-white border border-slate-700 text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Premium Research
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-8 leading-tight">
              {paper.title}
            </h1>
            
            {/* Author Meta Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-inner border border-slate-700">
                  <span className="text-white font-bold text-xl">
                    {paper.author.firstName[0]}{paper.author.lastName[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {paper.author.firstName} {paper.author.lastName}
                    {paper.author.qualification && (
                      <span className="text-[10px] bg-blue-100 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                        <GraduationCap className="w-3 h-3" /> {paper.author.qualification}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                    Verified {paper.author.role.toLowerCase()}
                  </p>
                </div>
              </div>
              
              {/* Dynamic Action Button */}
              {(paper.author.role === "TUTOR" || paper.author.role === "RESEARCHER") && (
                <Link 
                  href={`/tutors/${paper.authorId}`} 
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-500 transition-colors shadow-sm shrink-0 active:scale-[0.98]"
                >
                  Book for Tutoring
                </Link>
              )}
            </div>
          </header>

          {/* Dynamic Content Rendering */}
          <div className="prose prose-slate prose-lg max-w-none text-slate-700">
            
            <h2 id="abstract" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 border border-purple-200">
                <BookOpen className="w-5 h-5" />
              </div>
              Abstract & Overview
            </h2>
            <div className="whitespace-pre-wrap leading-relaxed mb-12 bg-white text-base">
              {paper.description}
            </div>

            {paper.techStack.length > 0 && (
              <>
                <h2 id="methodology" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 mt-12 border-t border-slate-100 pt-12">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 border border-blue-200">
                    <Layers className="w-5 h-5" />
                  </div>
                  Technical Stack
                </h2>
                <div className="flex flex-wrap gap-2 mb-12">
                  {paper.techStack.map((tech, idx) => (
                    <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 shadow-sm uppercase tracking-wider">
                      {tech}
                    </span>
                  ))}
                </div>
              </>
            )}

            {secureDocumentUrl && (
              <>
                <h2 id="document" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 mt-12 border-t border-slate-100 pt-12">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  Full Thesis Document
                </h2>
                <p className="text-sm text-slate-500 mb-6 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Securely loaded via encrypted viewer. Downloading is disabled to protect author IP.
                </p>
                
                {/* The Embedded Secure PDF Viewer */}
                <div className="w-full h-[85vh] min-h-150 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative">
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
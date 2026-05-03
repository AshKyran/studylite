// app/tutors/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma"; 
import { 
  Star, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileText,
  ChevronLeft,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. UPGRADE: Await params for Next.js 15 compatibility
  const resolvedParams = await params;

  // 2. Fetch the Creator and their published digital materials
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      notesCreated: {
        where: { isPublished: true },
        take: 6, // Showcase their latest 6 materials
        orderBy: { createdAt: "desc" }
      }
    }
  });

  // Ensure the user exists and is actually a creator
  if (!user || (user.role !== "TUTOR" && user.role !== "RESEARCHER")) {
    notFound();
  }

  // 3. Mock enriched data (In production, add these fields to the User model)
  const tutorDetails = {
    title: user.role === "RESEARCHER" ? "Verified Post-Grad Researcher" : "Senior Academic Creator",
    bio: `I specialize in compiling high-yield revision materials, comprehensive thesis reviews, and custom step-by-step PDF solutions. My goal is to provide you with exactly the digital resources you need to excel, without the fluff.`,
    baseRate: 1500, 
    rating: 4.8,
    reviews: 84,
    location: "Nairobi",
    tags: ["Advanced Physics", "Calculus", "Computer Science", "Thesis Review"],
    education: "MSc. Applied Mathematics",
    turnaround: "Typically delivers within 3 days",
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* Back Navigation */}
      <Link 
        href="/tutors" 
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN COLUMN (Left - 2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              <div className="w-24 h-24 shrink-0 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-black shadow-inner">
                {user.firstName[0]}{user.lastName[0]}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {user.firstName} {user.lastName}
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </h1>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {tutorDetails.title}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <strong className="text-slate-900 font-bold">{tutorDetails.rating}</strong> ({tutorDetails.reviews} reviews)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" /> {tutorDetails.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" /> {tutorDetails.education}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {tutorDetails.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">About Me</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              {tutorDetails.bio}
            </p>
          </div>

          {/* Published Materials Showcase */}
          {user.notesCreated.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
              <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Available Materials</h2>
                <Link href={`/explore?author=${user.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.notesCreated.map((note) => (
                  <Link 
                    href={`/explore/${note.id}`} 
                    key={note.id} 
                    className="flex flex-col p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {note.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
                          {note.level.replace("_", " ")}
                        </p>
                        <p className="text-sm font-black text-slate-900 mt-3">
                           {/* UPGRADE: Safe Decimal Handling */}
                           KES {Number(note.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR (Right - 1/3 width) */}
        <div className="lg:col-span-1">
          {/* Sticky Container */}
          <div className="sticky top-24 space-y-6">
            
            {/* The Hire Card */}
            <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
              <div className="p-8">
                <h3 className="text-white text-lg font-bold mb-2">Commission Custom Work</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Need a custom research paper, codebase, or specific notes? Hire me directly.
                </p>

                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mb-6 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starting Rate</p>
                  <p className="text-3xl font-black text-white">
                    KES {tutorDetails.baseRate.toLocaleString()}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start text-sm font-medium text-slate-300">
                    <Clock className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                    {tutorDetails.turnaround}
                  </li>
                  <li className="flex items-start text-sm font-medium text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                    Secure Escrow Payment
                  </li>
                </ul>

                <Link 
                  href={`/tutors/${user.id}/request`}
                  className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-base font-black text-slate-900 bg-emerald-500 hover:bg-emerald-400 transition-all duration-200 active:scale-[0.98]"
                >
                  Start Request <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="bg-slate-950 p-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your funds are protected until delivery.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
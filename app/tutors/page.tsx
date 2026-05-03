// app/tutors/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Star, MapPin, FileText, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TutorsDirectoryPage() {
  // 1. Fetch Verified Educators & Researchers securely
  const dbTutors = await prisma.user.findMany({
    where: {
      OR: [{ role: "TUTOR" }, { role: "RESEARCHER" }],
      isVerified: true,
      // CRITICAL UPGRADE: Ensures they finished KYC & have a Paystack account before listing them publicly
      isProfileComplete: true, 
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      _count: {
        select: { notesCreated: { where: { isPublished: true } } }
      }
    },
    take: 20,
  });

  // Map the database users to a robust display object (utilizing your mock extensions for UI rendering)
  const displayExperts = dbTutors.map((tutor, index) => {
    const locations = ["Nairobi", "Mombasa", "Remote", "Kiambu"];
    const tagsArr = [["Mathematics", "Physics"], ["Computer Science", "Programming"], ["Biology", "Chemistry"], ["Business", "Economics"]];
    
    return {
      id: tutor.id,
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      title: tutor.role === "RESEARCHER" ? "Verified Post-Grad Researcher" : "Senior Academic Tutor",
      baseRate: 1500 + (index * 200), // Mock base rate
      rating: 4.8 + (index % 3) * 0.1, // Mock rating
      reviews: 12 + index * 5, // Mock reviews
      location: locations[index % locations.length],
      tags: tagsArr[index % tagsArr.length],
      publishedCount: tutor._count.notesCreated,
    };
  });

  return (
    <div className="space-y-12">
      {/* Header Area */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Hire Top-Tier Academic Experts
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Commission custom research, project codebases, and personalized tutoring. All payments are secured by StudyLite Escrow.
        </p>
      </div>

      {/* Directory Grid */}
      {displayExperts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayExperts.map((expert) => (
            <div key={expert.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
              <div className="p-6 flex-1 space-y-5">
                
                {/* Profile Top */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-black shadow-inner">
                      {expert.firstName[0]}{expert.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                        {expert.firstName} {expert.lastName}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {expert.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Base Rate</p>
                    <p className="text-slate-900 font-black">KES {expert.baseRate.toLocaleString()}<span className="text-xs font-medium text-slate-500 font-sans">/task</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rating</p>
                    <p className="flex items-center gap-1.5 text-slate-900 font-black">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {expert.rating.toFixed(1)} <span className="text-xs font-medium text-slate-500 font-sans">({expert.reviews})</span>
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <span className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" /> {expert.location}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <FileText className="w-4 h-4 text-slate-400" /> {expert.publishedCount} Published Items
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {expert.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call To Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto grid grid-cols-2 gap-3">
                <Link 
                  href={`/tutors/${expert.id}`} 
                  className="flex justify-center items-center px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm shadow-sm"
                >
                  View Profile
                </Link>
                <Link 
                  href={`/tutors/${expert.id}/request`} 
                  className="flex justify-center items-center gap-1.5 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-sm active:scale-[0.98]"
                >
                  Commission <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">No experts available yet</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            We are currently verifying our new batch of tutors. Check back soon for the best academic experts.
          </p>
        </div>
      )}
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentRequestsPage() {
  // 1. Authenticate the Student
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  // 2. Fetch all requests made by this student, including the Tutor's name
  const requests = await prisma.materialRequest.findMany({
    where: { studentId: authUser.id },
    include: {
      tutor: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              My Requests
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Track the status of your custom notes, projects, and commissions.
            </p>
          </div>
          <Link 
            href="/tutors" 
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Request
          </Link>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => {
              // Determine status colors and badges
              const isPending = request.status === "PENDING";
              const isInProgress = request.status === "IN_PROGRESS";
              const isDelivered = request.status === "DELIVERED";
              const isRejected = request.status === "REJECTED";

              return (
                <div key={request.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                  
                  {/* Left Side: Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-black text-slate-900 line-clamp-1">
                        {request.title}
                      </h2>
                      {/* Status Badge */}
                      {isPending && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-lg">Pending Tutor Approval</span>}
                      {isInProgress && <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg">In Progress</span>}
                      {isDelivered && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg">Delivered</span>}
                      {isRejected && <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-lg">Declined & Refunded</span>}
                    </div>
                    
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {request.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Tutor: {request.tutor.firstName} {request.tutor.lastName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Due: {new Date(request.deadline).toLocaleDateString("en-KE", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Format: {request.format}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Financials & Actions */}
                  <div className="flex flex-col items-start md:items-end gap-3 min-w-35 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Escrow Locked</p>
                      <p className="text-2xl font-black text-slate-900">
                        KES {request.offerAmount.toLocaleString()}
                      </p>
                    </div>

                    {isDelivered && (
                      <button className="w-full md:w-auto mt-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download File
                      </button>
                    )}

                    {isRejected && (
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Funds Returned to Wallet
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No active requests</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
              You haven&apos;t requested any custom materials yet. Browse our top tutors and commission your first specialized project.
            </p>
            <Link 
              href="/tutors" 
              className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3.5 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
            >
              Browse Creators
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
}
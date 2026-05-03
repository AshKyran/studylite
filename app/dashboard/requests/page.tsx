// app/dashboard/requests/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileQuestion, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  AlertCircle 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  // 1. Authenticate the User
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  // 2. Fetch User to determine their role
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, currency: true },
  });

  if (!dbUser) redirect("/login");

  const isCreator = dbUser.role === "TUTOR" || dbUser.role === "RESEARCHER";

  // 3. Fetch requests based on role (Dual-Role logic)
  const requests = await prisma.materialRequest.findMany({
    where: isCreator ? { tutorId: authUser.id } : { studentId: authUser.id },
    include: {
      tutor: { select: { firstName: true, lastName: true } },
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Safe Currency Formatter
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: dbUser.currency || 'KES' 
    }).format(Number(amount));
  };

  // Helper to render beautiful status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Awaiting Action
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "REJECTED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> {status === "REJECTED" ? "Declined" : "Cancelled"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isCreator ? "Commissioned Work" : "My Requests"}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isCreator 
              ? "Manage incoming project requests and track deliveries." 
              : "Track the status of your custom notes, projects, and commissions."}
          </p>
        </div>
        
        {!isCreator && (
          <Link 
            href="/tutors" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors shrink-0 active:scale-[0.98]"
          >
            Hire a Tutor <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Requests Ledger */}
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(req.status)}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {req.format}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{req.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                    <p>
                      <span className="text-slate-400">Escrow Amount:</span>{" "}
                      <span className="text-slate-900 font-bold">{formatCurrency(req.offerAmount)}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Deadline:</span>{" "}
                      <span className={new Date(req.deadline) < new Date() && req.status !== "DELIVERED" ? "text-red-600 font-bold" : "text-slate-900 font-bold"}>
                        {new Date(req.deadline).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">{isCreator ? "Requested by:" : "Assigned to:"}</span>{" "}
                      <span className="text-slate-900 font-bold">
                        {isCreator 
                          ? `${req.student.firstName} ${req.student.lastName}`
                          : `${req.tutor.firstName} ${req.tutor.lastName}`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Call to Action based on Status & Role */}
                <div className="flex flex-col gap-3 shrink-0 w-full md:w-48">
                  <Link 
                    href={`/dashboard/requests/${req.id}`} 
                    className="w-full flex items-center justify-center py-3 px-4 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    View Details
                  </Link>

                  {/* Contextual actions */}
                  {isCreator && req.status === "PENDING" && (
                    <button className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                      Accept Job
                    </button>
                  )}
                  {isCreator && req.status === "IN_PROGRESS" && (
                    <button className="w-full flex items-center justify-center py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                      Deliver Files
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Premium Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No active requests</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
            {isCreator 
              ? "You haven't received any commission requests from students yet."
              : "You haven't requested any custom materials yet. Hire a tutor to get personalized help."}
          </p>
          {!isCreator && (
            <Link 
              href="/tutors" 
              className="inline-flex px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors active:scale-[0.98]"
            >
              Browse Available Tutors
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
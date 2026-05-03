// app/dashboard/commissions/CommissionsBoard.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCommissionStatus } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertCircle, XCircle, UploadCloud, FileText } from "lucide-react";

type MaterialRequest = {
  id: string;
  title: string;
  description: string;
  format: string;
  deadline: Date;
  offerAmount: number; // Safely mapped as number
  status: string;
  createdAt: Date;
  student: { firstName: string; lastName: string; };
};

export default function CommissionsBoard({ initialRequests }: { initialRequests: MaterialRequest[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED">("PENDING");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const filteredRequests = initialRequests.filter((req) => {
    if (activeTab === "PENDING") return req.status === "PENDING";
    if (activeTab === "IN_PROGRESS") return req.status === "IN_PROGRESS";
    return req.status === "DELIVERED" || req.status === "REJECTED" || req.status === "CANCELLED";
  });

  const handleStatusChange = async (id: string, newStatus: string, fileUrl?: string) => {
    setIsUpdating(id);
    const toastId = toast.loading("Updating commission status...");
    
    try {
      await updateCommissionStatus(id, newStatus, fileUrl);
      toast.success("Commission updated successfully!", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status", { id: toastId });
    } finally {
      setIsUpdating(null);
      setActiveUploadId(null);
    }
  };

  const handleFileDelivery = async (e: React.ChangeEvent<HTMLInputElement>, requestId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdating(requestId);
    const toastId = toast.loading("Uploading deliverable and releasing escrow...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed");

      const fileExt = file.name.split('.').pop();
      const filePath = `deliverables/${requestId}_${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product_files") // Ensure this bucket exists!
        .upload(filePath, file);

      if (uploadError) throw new Error("Failed to upload file to secure storage.");

      // 2. Trigger Payout and Update Database
      await updateCommissionStatus(requestId, "DELIVERED", filePath);
      
      toast.success("File delivered and escrow released to your wallet!", { 
        id: toastId,
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
      });
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || "Delivery failed", { id: toastId });
    } finally {
      setIsUpdating(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const tabs = [
    { id: "PENDING", label: "New Requests", icon: Clock },
    { id: "IN_PROGRESS", label: "In Progress", icon: AlertCircle },
    { id: "COMPLETED", label: "History", icon: CheckCircle2 },
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Board */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((request) => {
            const isLate = new Date(request.deadline) < new Date() && request.status !== "DELIVERED";
            
            return (
              <div key={request.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {request.format}
                  </span>
                  <span className="text-xl font-black text-slate-900">KES {request.offerAmount.toLocaleString()}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{request.title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">{request.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-slate-400 font-medium mb-1">Requested by</span>
                    <span className="font-bold text-slate-900">{request.student.firstName} {request.student.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium mb-1">Deadline</span>
                    <span className={`font-bold ${isLate ? "text-red-600" : "text-slate-900"}`}>
                      {new Date(request.deadline).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                  {request.status === "PENDING" && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(request.id, "IN_PROGRESS")}
                        disabled={isUpdating !== null}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                      >
                        {isUpdating === request.id ? "Accepting..." : "Accept Request"}
                      </button>
                      <button 
                        onClick={() => handleStatusChange(request.id, "REJECTED")}
                        disabled={isUpdating !== null}
                        className="flex-1 bg-white border border-slate-200 text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {request.status === "IN_PROGRESS" && (
                    <div className="w-full relative">
                      {activeUploadId === request.id ? (
                        <>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept=".pdf,.zip,.docx"
                            onChange={(e) => handleFileDelivery(e, request.id)} 
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUpdating === request.id}
                              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                            >
                              <UploadCloud className="w-5 h-5" />
                              {isUpdating === request.id ? "Uploading..." : "Select File to Deliver"}
                            </button>
                            <button 
                              onClick={() => setActiveUploadId(null)}
                              disabled={isUpdating === request.id}
                              className="bg-slate-100 text-slate-500 hover:bg-slate-200 p-3 rounded-xl transition-colors"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => setActiveUploadId(request.id)}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
                        >
                          <FileText className="w-5 h-5" /> Deliver Work & Get Paid
                        </button>
                      )}
                    </div>
                  )}

                  {request.status === "DELIVERED" && (
                    <div className="w-full text-center flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-sm">
                      <CheckCircle2 className="w-5 h-5" /> Delivered & Paid
                    </div>
                  )}

                  {request.status === "REJECTED" && (
                    <div className="w-full text-center px-4 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 text-sm">
                      Declined / Refunded
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No {activeTab.toLowerCase().replace('_', ' ')} requests</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            When students commission you for custom work, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
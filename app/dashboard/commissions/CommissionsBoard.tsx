"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCommissionStatus } from "./actions";
import { createClient } from "@/utils/supabase/client";

type MaterialRequest = {
  id: string;
  title: string;
  description: string;
  format: string;
  deadline: Date;
  offerAmount: number;
  status: string;
  createdAt: Date;
  student: {
    firstName: string;
    lastName: string;
  };
};

export default function CommissionsBoard({ initialRequests }: { initialRequests: MaterialRequest[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const requests = initialRequests;
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED">("PENDING");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "PENDING") return req.status === "PENDING";
    if (activeTab === "IN_PROGRESS") return req.status === "IN_PROGRESS";
    return req.status === "DELIVERED" || req.status === "REJECTED";
  });

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      await updateCommissionStatus(id, newStatus); 
      setIsUpdating(null);
      router.refresh(); // FIX: Tells UI to reflect the new status
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update status";
      alert(message);
      setIsUpdating(null);
    }
  };

  const handleFileUploadAndDelivery = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeUploadId) return;

    setIsUpdating(activeUploadId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeUploadId}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('commissions')
        .upload(fileName, file);

      if (uploadError) throw new Error("Failed to upload file. Please try again.");

      await updateCommissionStatus(activeUploadId, "DELIVERED");
      alert("File delivered successfully! Escrow funds have been released to your wallet.");
      router.refresh(); // FIX: Tells UI to reflect the delivery
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      alert(message);
    } finally {
      setIsUpdating(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = (id: string) => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept=".pdf,.zip,.doc,.docx"
        onChange={handleFileUploadAndDelivery} 
      />

      <div className="flex space-x-2 border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? "border-emerald-500 text-emerald-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {tab === "PENDING" && "New Requests"}
            {tab === "IN_PROGRESS" && "Active Work"}
            {tab === "COMPLETED" && "History"}
            
            {tab === "PENDING" && requests.some(r => r.status === "PENDING") && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-black text-white bg-rose-500 rounded-full">
                {requests.filter(r => r.status === "PENDING").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => {
            const isUrgent = currentTime > 0 && new Date(request.deadline).getTime() < currentTime + (86400000 * 2);

            return (
              <div key={request.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col h-full relative overflow-hidden transition-all hover:shadow-md">
                
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 ${
                      request.format === 'PDF' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      request.format === 'ZIP_BUNDLE' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {request.format.replace("_", " ")}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {request.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="block text-2xl font-black text-emerald-600">
                      KES {request.offerAmount.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Escrow</span>
                  </div>
                </div>

                <div className="grow mb-8">
                  <div className="flex flex-wrap gap-y-4 gap-x-8 mb-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requested By</p>
                      <p className="text-sm font-bold text-slate-900 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-2 text-xs">
                          {request.student.firstName[0]}
                        </span>
                        {request.student.firstName} {request.student.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
                      <p className={`text-sm font-bold flex items-center ${isUrgent ? 'text-rose-600' : 'text-slate-900'}`}>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(request.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</p>
                    <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">
                      {request.description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  {request.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleStatusUpdate(request.id, "REJECTED")}
                        disabled={isUpdating === request.id}
                        className="px-4 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(request.id, "IN_PROGRESS")}
                        disabled={isUpdating === request.id}
                        className="px-4 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors text-sm shadow-md flex justify-center items-center"
                      >
                        {isUpdating === request.id ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : "Accept Request"}
                      </button>
                    </div>
                  )}

                  {request.status === "IN_PROGRESS" && (
                    <button 
                      onClick={() => triggerFileInput(request.id)}
                      disabled={isUpdating === request.id}
                      className="w-full flex justify-center items-center px-4 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {isUpdating === request.id ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Upload & Deliver Material
                        </>
                      )}
                    </button>
                  )}

                  {request.status === "DELIVERED" && (
                    <div className="w-full text-center px-4 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-sm flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Delivered & Paid
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
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No {activeTab.replace("_", " ").toLowerCase()} requests</h3>
          <p className="text-slate-500 font-medium">
            {activeTab === "PENDING" ? "You're all caught up! Waiting for new students to commission you." : "Nothing to show here right now."}
          </p>
        </div>
      )}
    </div>
  );
}
// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md font-sans">
      <div className="relative flex items-center justify-center">
        {/* Glowing pulsing background effect */}
        <div className="absolute inset-0 h-20 w-20 animate-ping rounded-full bg-indigo-500/20"></div>
        
        {/* Main spinning icon container */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_0_40px_rgba(79,70,229,0.15)] border border-slate-100">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Loading StudyLite...
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-500 animate-pulse uppercase tracking-widest">
          Preparing Your Dashboard...
        </p>
      </div>
    </div>
  );
}
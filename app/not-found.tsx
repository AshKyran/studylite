// app/not-found.tsx
import Link from "next/link";
import { SearchX, Home, Library } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans px-4 selection:bg-indigo-200 selection:text-indigo-900">
      <div className="max-w-lg w-full text-center space-y-8 relative z-10">
        
        {/* Glowing 404 Icon Container */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full w-48 h-48 mx-auto -translate-y-4"></div>
          <div className="relative bg-white p-8 rounded-4xl shadow-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              404
            </h1>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Resource Not Found
          </h2>
          <p className="text-base text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            The page, document, or assessment you are looking for has vanished into the academic void. It might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link 
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link 
            href="/explore"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-black text-sm rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Library className="w-5 h-5" />
            Browse Library
          </Link>
        </div>
        
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/30 blur-[100px]"></div>
      </div>
    </div>
  );
}
// app/(explore)/tests/layout.tsx
import { BrainCircuit } from "lucide-react";

export const metadata = {
  title: "Assessment Engine | StudyLite",
  description: "Test your knowledge with custom quizzes and formal exams.",
};

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-200 selection:text-indigo-900 flex flex-col">
      {/* Optional: Assessment Engine Sub-Header */}
      <div className="bg-indigo-600 text-indigo-50 py-2 text-center text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-inner md:flex">
        <BrainCircuit className="w-4 h-4" /> StudyLite Assessment Engine Active
      </div>
      
      {/* Engine Content Stage */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
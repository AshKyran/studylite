// app/(explore)/tests/generator/GeneratorForm.tsx
"use client";

import { useState } from "react";
import { generateExamPdf } from "./actions";
import { toast } from "sonner";
import { 
  FileText, 
  Settings, 
  Download, 
  CheckCircle2, 
  LibraryBig, 
  GraduationCap, 
  Hash
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

interface GeneratorFormProps {
  subjects: Subject[];
}

export default function GeneratorForm({ subjects }: GeneratorFormProps) {
  // Form State
  const [subjectId, setSubjectId] = useState(subjects.length > 0 ? subjects[0].id : "");
  const [level, setLevel] = useState("HIGH_SCHOOL");
  const [questionCount, setQuestionCount] = useState(20);
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);
  
  // Submission State
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !level) {
      toast.error("Please select both a subject and an education level.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Compiling your PDF assessment...");

    try {
      const result = await generateExamPdf({ 
        subjectId, 
        level, 
        questionCount, 
        includeMarkingScheme 
      });

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success && result.base64Pdf && result.filename) {
        // Trigger the Download in the browser
        const link = document.createElement('a');
        link.href = result.base64Pdf;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("PDF generated successfully!", { 
          id: toastId,
          style: { background: '#e0e7ff', color: '#3730a3', border: '1px solid #818cf8' }
        });
      }
    } catch (err) {
      toast.error("A critical error occurred. Please try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <LibraryBig className="w-5 h-5 text-indigo-500" /> Academic Setup
          </h2>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Subject</label>
            <select 
              value={subjectId} 
              onChange={(e) => setSubjectId(e.target.value)} 
              disabled={isGenerating}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-60"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Education Level</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)} 
                disabled={isGenerating}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-60"
              >
                <option value="HIGH_SCHOOL">High School</option>
                <option value="COLLEGE">College / University</option>
                <option value="GENERAL">General Assessment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-indigo-500" /> Output Configuration
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Question Count</span>
              <span className="text-indigo-600">{questionCount} Qs</span>
            </label>
            <div className="relative flex items-center">
              <Hash className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="number" 
                min="5" max="50" 
                value={questionCount} 
                onChange={(e) => setQuestionCount(Number(e.target.value))} 
                disabled={isGenerating}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60" 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Maximum 50 questions per PDF generation.</p>
          </div>

          <div className="pt-2">
            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${includeMarkingScheme ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
              <div className={`shrink-0 ${includeMarkingScheme ? 'text-indigo-600' : 'text-slate-300'}`}>
                {includeMarkingScheme ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
              </div>
              <div>
                <span className={`block font-bold text-sm ${includeMarkingScheme ? 'text-indigo-900' : 'text-slate-700'}`}>Include Marking Scheme</span>
                <span className="block text-xs font-medium text-slate-500 mt-0.5">Append an official answer key to the end of the PDF.</span>
              </div>
              <input 
                type="checkbox" 
                checked={includeMarkingScheme} 
                onChange={(e) => setIncludeMarkingScheme(e.target.checked)} 
                disabled={isGenerating}
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] text-base font-black text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          {isGenerating ? (
            <span className="flex items-center space-x-2">
              <FileText className="w-5 h-5 animate-pulse" />
              <span>Generating Document...</span>
            </span>
          ) : (
            <span className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Download Custom PDF
            </span>
          )}
        </button>
      </div>

    </form>
  );
}
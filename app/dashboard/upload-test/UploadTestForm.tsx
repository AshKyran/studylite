// app/dashboard/upload-test/UploadTestForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExamAction, CreateExamPayload } from "./actions";
import { toast } from "sonner";
import { PlusCircle, Trash2, CheckCircle2, Circle, UploadCloud } from "lucide-react";

interface UploadTestFormProps {
  subjects: { id: string; name: string }[];
}

export default function UploadTestForm({ subjects }: UploadTestFormProps) {
  const router = useRouter();
  
  // Basic Exam State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(subjects.length > 0 ? subjects[0].id : "");
  const [level, setLevel] = useState("HIGH_SCHOOL");
  const [type, setType] = useState("QUIZ");
  const [duration, setDuration] = useState<number | "">("");

  // Dynamic Questions State
  const [questions, setQuestions] = useState<CreateExamPayload["questions"]>([
    { text: "", marks: 1, explanation: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE HANDLERS ---
  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { text: "", marks: 1, explanation: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    } else {
      toast.error("You must have at least one question.");
    }
  };

  const updateQuestion = <K extends keyof CreateExamPayload["questions"][0]>(
    qIndex: number, field: K, value: CreateExamPayload["questions"][0][K]
  ) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, correctOIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === correctOIndex,
    }));
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      // Ensure at least one option remains correct
      if (!updated[qIndex].options.some((o) => o.isCorrect)) {
        updated[qIndex].options[0].isCorrect = true;
      }
      setQuestions(updated);
    } else {
      toast.error("Questions must have at least two options.");
    }
  };

  // --- SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end Validation
    if (!subjectId) return toast.error("Please select a subject.");
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) return toast.error(`Question ${i + 1} is missing text.`);
      if (questions[i].options.some(o => !o.text.trim())) return toast.error(`Question ${i + 1} has empty options.`);
    }

    setIsSubmitting(true);
    toast.loading("Publishing assessment...");

    try {
      const payload: CreateExamPayload = {
        title,
        description,
        subjectId,
        level,
        type,
        duration: duration === "" ? null : Number(duration),
        questions,
      };

      const result = await createExamAction(payload);
      toast.dismiss();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Assessment published successfully!", {
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
        });
        router.push("/explore/tests");
      }
    } catch (error: unknown) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      
      {/* SECTION 1: Test Meta */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">General Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Assessment Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={isSubmitting} placeholder="e.g. Calculus Midterm 2026" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={isSubmitting} rows={3} placeholder="Brief details about the test..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Education Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none">
              <option value="HIGH_SCHOOL">High School</option>
              <option value="COLLEGE">College / University</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Assessment Type</label>
            <select value={type} onChange={e => setType(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none">
              <option value="QUIZ">Practice Quiz</option>
              <option value="EXAM">Formal Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Time Limit (Minutes)</label>
            <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value === "" ? "" : Number(e.target.value))} disabled={isSubmitting} placeholder="Leave blank for untimed" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>
        </div>
      </div>

      {/* SECTION 2: Questions Builder */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative group">
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">Question {qIndex + 1}</h3>
              <button type="button" onClick={() => removeQuestion(qIndex)} disabled={isSubmitting} className="text-slate-400 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question Text</label>
                  <textarea required value={q.text} onChange={e => updateQuestion(qIndex, "text", e.target.value)} disabled={isSubmitting} rows={2} placeholder="Type your question here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Points</label>
                  <input required type="number" min="1" value={q.marks} onChange={e => updateQuestion(qIndex, "marks", Number(e.target.value))} disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Options</label>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <button type="button" onClick={() => setCorrectOption(qIndex, oIndex)} disabled={isSubmitting} className={`shrink-0 p-1 rounded-full transition-colors ${opt.isCorrect ? "text-emerald-500" : "text-slate-300 hover:text-indigo-400"}`}>
                      {opt.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <input required type="text" value={opt.text} onChange={e => updateOptionText(qIndex, oIndex, e.target.value)} disabled={isSubmitting} placeholder={`Option ${oIndex + 1}`} className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none ${opt.isCorrect ? "border-emerald-200 bg-emerald-50/30 focus:border-emerald-500" : "border-slate-200 bg-slate-50 focus:border-indigo-500"}`} />
                    <button type="button" onClick={() => removeOption(qIndex, oIndex)} disabled={isSubmitting} className="text-slate-400 hover:text-red-500 p-2 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addOption(qIndex)} disabled={isSubmitting} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 mt-2 ml-10">
                  <PlusCircle className="w-4 h-4" /> Add Option
                </button>
              </div>

              {/* Explanation */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Explanation (Optional)</label>
                <input type="text" value={q.explanation} onChange={e => updateQuestion(qIndex, "explanation", e.target.value)} disabled={isSubmitting} placeholder="Why is the answer correct?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
              </div>
            </div>

          </div>
        ))}

        <button type="button" onClick={addQuestion} disabled={isSubmitting} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all flex justify-center items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Add Another Question
        </button>
      </div>

      {/* SECTION 3: Submission */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-white font-bold text-lg">Ready to publish?</h3>
          <p className="text-slate-400 text-sm mt-1">This assessment will instantly be available in the marketplace.</p>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? "Publishing Test..." : <><UploadCloud className="w-5 h-5" /> Publish Now</>}
        </button>
      </div>

    </form>
  );
}
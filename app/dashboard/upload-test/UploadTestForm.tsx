"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExamAction, CreateExamPayload } from "./actions";

interface UploadTestFormProps {
  subjects: { id: string; name: string }[];
}

export default function UploadTestForm({ subjects }: UploadTestFormProps) {
  const router = useRouter();
  
  // 1. Basic Exam State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [level, setLevel] = useState("HIGH_SCHOOL");
  const [type, setType] = useState("QUIZ");
  const [duration, setDuration] = useState<number | "">("");

  // 2. Dynamic Questions State
  const [questions, setQuestions] = useState<CreateExamPayload["questions"]>([
    { text: "", marks: 1, explanation: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- STATE HANDLERS ---
  const addQuestion = () => {
    setQuestions([...questions, { text: "", marks: 1, explanation: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    }
  };

  const updateQuestion = (qIndex: number, field: string, value: string | number) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIndex
    }));
    setQuestions(updated);
  };

  // --- SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Basic Validation
      if (!subjectId) throw new Error("Please select a subject.");
      if (questions.some(q => q.text.trim() === "")) throw new Error("All questions must have text.");
      if (questions.some(q => q.options.some(o => o.text.trim() === ""))) throw new Error("All options must have text.");

      await createExamAction({
        title,
        description,
        subjectId,
        level,
        type,
        duration: duration === "" ? null : Number(duration),
        questions
      });

      router.push("/dashboard?success=exam_published");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish exam.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* SECTION 1: Exam Details */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">1. Core Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Exam Title *</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. KCSE Biology Mock 2026" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Subject *</label>
            <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select a subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Level *</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="HIGH_SCHOOL">High School</option>
              <option value="COLLEGE">College / University</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Exam Type *</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="QUIZ">Standard Quiz</option>
              <option value="TIMED">Strict Timed Exam</option>
              <option value="LIVE">Live Arena Test</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Mins)</label>
            <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value ? Number(e.target.value) : "")} placeholder="Leave blank if untimed" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Instructions / Description</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide any instructions for the students..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {/* SECTION 2: Questions Builder */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 px-2 flex items-center justify-between">
          <span>2. Test Questions</span>
          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">{questions.length} Total</span>
        </h2>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative group transition-shadow hover:shadow-md">
            
            {/* Remove Question Button */}
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}

            <div className="mb-4">
              <label className="block text-sm font-black text-blue-600 mb-2 uppercase tracking-wider">Question {qIndex + 1}</label>
              <textarea required rows={2} value={q.text} onChange={e => updateQuestion(qIndex, "text", e.target.value)} placeholder="Type your question here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>

            {/* Options Builder */}
            <div className="pl-4 border-l-2 border-slate-100 space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Multiple Choice Options (Select Correct Answer)</label>
              
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-3">
                  <input type="radio" name={`correct-${qIndex}`} checked={opt.isCorrect} onChange={() => setCorrectOption(qIndex, oIndex)} className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                  <input required type="text" value={opt.text} onChange={e => updateOptionText(qIndex, oIndex, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIndex)}`} className={`flex-1 bg-slate-50 border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors ${opt.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 focus:border-blue-400"}`} />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-slate-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  )}
                </div>
              ))}
              
              {q.options.length < 5 && (
                <button type="button" onClick={() => addOption(qIndex)} className="text-sm font-bold text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1">
                  + Add Option
                </button>
              )}
            </div>

            {/* Explanations & Marks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Marking Scheme Explanation (Optional)</label>
                <input type="text" value={q.explanation} onChange={e => updateQuestion(qIndex, "explanation", e.target.value)} placeholder="Explain why the answer is correct for the PDF generator..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
                <input type="number" min="1" value={q.marks} onChange={e => updateQuestion(qIndex, "marks", Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

          </div>
        ))}

        <button type="button" onClick={addQuestion} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 font-bold hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all flex justify-center items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Another Question
        </button>
      </div>

      {/* SECTION 3: Submission */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-white font-bold text-lg">Ready to publish?</h3>
          <p className="text-slate-400 text-sm mt-1">This will instantly be available in the Assessment Engine.</p>
          {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black transition-colors disabled:opacity-50 shrink-0 shadow-lg">
          {isSubmitting ? "Saving Assessment..." : "Publish Assessment"}
        </button>
      </div>

    </form>
  );
}
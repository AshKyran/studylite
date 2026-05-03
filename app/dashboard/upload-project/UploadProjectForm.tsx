// app/dashboard/upload-project/UploadProjectForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createProjectAction } from "./actions";
import { toast } from "sonner";
import { Briefcase, FileText, Code, X } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

export default function UploadProjectForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    subjectId: subjects.length > 0 ? subjects[0].id : "",
    level: "COLLEGE" as "HIGH_SCHOOL" | "COLLEGE" | "GENERAL",
    demoUrl: "",
  });
  
  // Tech Stack Tags
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Files
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [sourceCodeFile, setSourceCodeFile] = useState<File | null>(null);

  // Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const tag = currentTag.trim();
      if (tag && !techStack.includes(tag) && techStack.length < 10) {
        setTechStack([...techStack, tag]);
        setCurrentTag("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTechStack(techStack.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentFile && !sourceCodeFile) {
      toast.error("You must upload either documentation or source code (or both).");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Encrypting and uploading project files...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired. Please log in again.");

      const timestamp = new Date().getTime();
      let documentPath = null;
      let sourceCodePath = null;

      // 1. Upload Documentation
      if (documentFile) {
        const ext = documentFile.name.split('.').pop();
        documentPath = `${user.id}/${timestamp}_doc.${ext}`;
        const { error } = await supabase.storage.from('product_files').upload(documentPath, documentFile);
        if (error) throw new Error("Failed to upload documentation file.");
      }

      // 2. Upload Source Code
      if (sourceCodeFile) {
        const ext = sourceCodeFile.name.split('.').pop();
        sourceCodePath = `${user.id}/${timestamp}_code.${ext}`;
        const { error } = await supabase.storage.from('product_files').upload(sourceCodePath, sourceCodeFile);
        if (error) throw new Error("Failed to upload source code file.");
      }

      // 3. Save to Database
      const result = await createProjectAction({
        ...formData,
        price: Number(formData.price) || 0,
        techStack,
        documentUrl: documentPath,
        sourceCodeUrl: sourceCodePath,
      });

      if (result.error) {
        // 🚨 ROLLBACK
        const filesToRemove = [documentPath, sourceCodePath].filter(Boolean) as string[];
        if (filesToRemove.length > 0) {
          await supabase.storage.from('product_files').remove(filesToRemove);
        }
        throw new Error(result.error);
      }

      toast.dismiss();
      toast.success("Project published successfully!", {
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
      });
      router.push("/dashboard");

    } catch (error: unknown) {
      toast.dismiss();
      toast.error((error as Error).message || "An error occurred while uploading.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
      {/* (Keep all the input fields exactly as you had them, just wire them to formData/handleChange) */}
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} disabled={isSubmitting} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} disabled={isSubmitting} rows={4} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Price (KES)</label>
            <input required type="number" name="price" value={formData.price} onChange={handleChange} disabled={isSubmitting} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
            <select name="subjectId" value={formData.subjectId} onChange={handleChange} disabled={isSubmitting} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Level</label>
            <select name="level" value={formData.level} onChange={handleChange} disabled={isSubmitting} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
              <option value="HIGH_SCHOOL">High School</option>
              <option value="COLLEGE">College / University</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block text-sm font-bold text-slate-700">Technologies Used</label>
        <div className="flex gap-2">
          <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleAddTag} disabled={isSubmitting} placeholder="e.g. React, Python, PostgreSQL" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          <button type="button" onClick={handleAddTag} disabled={isSubmitting} className="px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Add</button>
        </div>
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {techStack.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                {tag} <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-900"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-emerald-700"><FileText className="w-6 h-6" /><h3 className="font-bold">Documentation</h3></div>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} disabled={isSubmitting} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer disabled:opacity-60" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-blue-700"><Code className="w-6 h-6" /><h3 className="font-bold">Source Code (.zip)</h3></div>
          <input type="file" accept=".zip,.rar" onChange={(e) => setSourceCodeFile(e.target.files?.[0] || null)} disabled={isSubmitting} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-60" />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
        {isSubmitting ? "Publishing Project..." : <><Briefcase className="w-6 h-6" /> Publish Project</>}
      </button>
    </form>
  );
}
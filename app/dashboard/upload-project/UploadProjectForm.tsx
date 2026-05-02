"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createProjectAction } from "./actions";

interface Subject {
  id: string;
  name: string;
}

interface UploadProjectFormProps {
  subjects: Subject[];
  userId: string;
}

export default function UploadProjectForm({ subjects, userId }: UploadProjectFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState("");
  const [level, setLevel] = useState("COLLEGE");
  const [demoUrl, setDemoUrl] = useState("");
  
  // Tech Stack Tags State
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // File State
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [sourceCodeFile, setSourceCodeFile] = useState<File | null>(null);

  // Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Handler for adding tech tags
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter" || e.type === "click") && currentTag.trim() !== "") {
      e.preventDefault();
      if (!techStack.includes(currentTag.trim())) {
        setTechStack([...techStack, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTechStack(techStack.filter((tag) => tag !== tagToRemove));
  };

  // Main Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentFile && !sourceCodeFile) {
      alert("Please upload at least a document report or a source code ZIP.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedDocUrl = null;
      let uploadedCodeUrl = null;

      // 1. Upload Document to Supabase Storage (if provided)
      if (documentFile) {
        setUploadProgress("Uploading documentation...");
        const docPath = `${userId}/projects/${Date.now()}_${documentFile.name}`;
        const { error: docError } = await supabase.storage
          .from("product_files")
          .upload(docPath, documentFile);
          
        if (docError) throw new Error("Failed to upload document: " + docError.message);
        uploadedDocUrl = docPath;
      }

      // 2. Upload Source Code to Supabase Storage (if provided)
      if (sourceCodeFile) {
        setUploadProgress("Uploading source code...");
        const codePath = `${userId}/projects/${Date.now()}_${sourceCodeFile.name}`;
        const { error: codeError } = await supabase.storage
          .from("product_files")
          .upload(codePath, sourceCodeFile);
          
        if (codeError) throw new Error("Failed to upload source code: " + codeError.message);
        uploadedCodeUrl = codePath;
      }

      // 3. Save to Database via Server Action
      setUploadProgress("Finalizing project...");
      await createProjectAction({
        title,
        description,
        price: Number(price) || 0,
        subjectId,
        level,
        demoUrl,
        techStack,
        documentUrl: uploadedDocUrl,
        sourceCodeUrl: uploadedCodeUrl,
      });

      // 4. Redirect to Dashboard on Success
      router.push("/dashboard?success=project_uploaded");
      router.refresh();

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong during upload.";
      alert(errorMessage);
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* 1. Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">1. Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Project Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g., Hospital Management System" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Price (KES) *</label>
            <input type="number" min="0" required value={price} onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="0 for free, e.g. 5000" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Category / Subject *</label>
            <select required value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="">Select a category...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Education Level *</label>
            <select required value={level} onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="COLLEGE">University / College</option>
              <option value="HIGH_SCHOOL">High School</option>
              <option value="GENERAL">General / Professional</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Full Description *</label>
          <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Describe the project, what it solves, and what the buyer will receive..." />
        </div>
      </div>

      {/* 2. Technical Specs */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">2. Technical Specifications</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Live Demo URL (Optional)</label>
          <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="https://my-project-demo.com" />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Tech Stack (Press Enter to add)</label>
          <div className="flex gap-2">
            <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleAddTag}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g., React, Python, PostgreSQL..." />
            <button type="button" onClick={handleAddTag} className="px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
              Add Tag
            </button>
          </div>
          
          {/* Tag Render Area */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {techStack.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-900 focus:outline-none">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. File Uploads */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">3. Deliverables (Upload at least one)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <label className="block cursor-pointer">
              <span className="block text-sm font-bold text-slate-700 mb-1">Technical Report / Thesis (PDF)</span>
              <span className="block text-xs text-slate-500 mb-4">Upload the documentation</span>
              <input type="file" accept="application/pdf" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <label className="block cursor-pointer">
              <span className="block text-sm font-bold text-slate-700 mb-1">Source Code (.zip)</span>
              <span className="block text-xs text-slate-500 mb-4">Upload the complete codebase</span>
              <input type="file" accept=".zip,.rar,.7z" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors"
                onChange={(e) => setSourceCodeFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>
      </div>

      {/* Submission Footer */}
      <div className="pt-8 border-t border-slate-100 flex flex-col items-end">
        {uploadProgress && (
          <p className="text-sm font-bold text-blue-600 mb-4 animate-pulse">
            {uploadProgress}
          </p>
        )}
        <button type="submit" disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-black transition-colors">
          {isSubmitting ? "Uploading Project..." : "Publish Project"}
        </button>
      </div>

    </form>
  );
}
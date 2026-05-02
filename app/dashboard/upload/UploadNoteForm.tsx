// components/UploadNoteForm.tsx (or wherever you placed it)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Your new browser client
import { createNoteRecord } from "@/app/dashboard/upload/actions"; // Your new server action

type Subject = {
  id: string;
  name: string;
};


export default function UploadNoteForm({ subjects, userId }: { subjects: Subject[], userId: string }) {
  
  const router = useRouter();
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No browser session found");
    
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "COLLEGE" as "HIGH_SCHOOL" | "COLLEGE" | "GENERAL",
    subjectId: subjects.length > 0 ? subjects[0].id : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!mainFile) return setError("Please upload the actual product file (ZIP/PDF/Video).");
    if (!thumbnailFile) return setError("Please upload an advertisement picture (Thumbnail).");

    setLoading(true);

    try {
      // 1. UPLOAD THUMBNAIL (Public Bucket)
      setLoadingText("Uploading cover image...");
      const thumbExt = thumbnailFile.name.split('.').pop();
      const thumbPath = `${userId}/${Date.now()}-thumb.${thumbExt}`;
      
      const { error: thumbErr } = await supabase.storage
        .from('product_thumbnails')
        .upload(thumbPath, thumbnailFile);
        
      if (thumbErr) throw new Error("Failed to upload thumbnail image.");

      // 2. UPLOAD MAIN FILE (Private Bucket)
      setLoadingText("Uploading main product file... This might take a moment.");
      const fileExt = mainFile.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}-product.${fileExt}`;
      
      const { error: fileErr } = await supabase.storage
        .from('product_files')
        .upload(filePath, mainFile);

      if (fileErr) throw new Error("Failed to upload the main file.");

      // 3. SAVE TO DATABASE VIA SERVER ACTION
      setLoadingText("Finalizing product listing...");
      const dbResult = await createNoteRecord({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        level: formData.level,
        subjectId: formData.subjectId,
        authorId: userId,
        contentUrl: filePath, // The private path we will use later to generate secure downloads
        thumbnailUrl: thumbPath, // The public path for the marketplace UI
      });

      if (dbResult.error) throw new Error(dbResult.error);

      // 4. SUCCESS CLEANUP
      setSuccess(true);
      setFormData({ ...formData, title: "", description: "", price: "" });
      setMainFile(null);
      setThumbnailFile(null);
      
      // Redirect to dashboard overview after a short delay
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during upload.";
      setError(message);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
      
      {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 font-medium">Product uploaded successfully! Redirecting...</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Product Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Complete Calculus II Final Notes"
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
          <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} placeholder="What will students learn from this material?"
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Subject Category</label>
          <select name="subjectId" value={formData.subjectId} onChange={handleChange}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-white">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Education Level</label>
          <select name="level" value={formData.level} onChange={handleChange}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-white">
            <option value="HIGH_SCHOOL">High School</option>
            <option value="COLLEGE">College / University</option>
            <option value="GENERAL">General / Professional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Price (KES)</label>
          <input required type="number" step="1" min="0" name="price" value={formData.price} onChange={handleChange} placeholder="0 for Free"
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-4 border-t border-slate-100">
        
        {/* THUMBNAIL UPLOAD (PUBLIC) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
          <label className="block text-sm font-bold text-slate-700 mb-2">Advertisement Cover Image</label>
          <p className="text-xs text-slate-500 mb-3">Visible to everyone in the marketplace. Use a high-quality 16:9 image (PNG/JPG).</p>
          <input required type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
        </div>

        {/* MAIN FILE UPLOAD (PRIVATE) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
          <label className="block text-sm font-bold text-slate-700 mb-2">Actual Product File</label>
          <p className="text-xs text-slate-500 mb-3">This is secure. Buyers only get this file AFTER paying (ZIP, PDF, MP4).</p>
          <input required type="file" accept=".pdf,.doc,.docx,.zip,.mp4" onChange={(e) => setMainFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer" />
        </div>

      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {loadingText}
            </span>
          ) : (
            "Publish to Marketplace"
          )}
        </button>
      </div>
    </form>
  );
}

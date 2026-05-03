// app/dashboard/upload/UploadNoteForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { createNoteRecord } from "@/app/dashboard/upload/actions"; 
import { toast } from "sonner";
import { UploadCloud, FileText, Image as ImageIcon } from "lucide-react";

type Subject = {
  id: string;
  name: string;
};

interface UploadNoteFormProps {
  subjects: Subject[];
}

export default function UploadNoteForm({ subjects }: UploadNoteFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  
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
    
    if (!mainFile) {
      toast.error("Please select a main document file to upload.");
      return;
    }

    if (!formData.subjectId) {
      toast.error("Please select an academic subject.");
      return;
    }

    setLoading(true);
    toast.loading("Encrypting and uploading your files...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication error. Please log in again.");

      const timestamp = new Date().getTime();

      // 1. Upload Main Document File
      const mainFileExt = mainFile.name.split('.').pop();
      const mainFilePath = `${user.id}/${timestamp}_main.${mainFileExt}`;
      
      const { error: mainUploadError } = await supabase.storage
        .from('product_files')
        .upload(mainFilePath, mainFile);

      if (mainUploadError) throw new Error("Failed to upload the main document.");

      // 2. Upload Thumbnail File (Optional but recommended)
      let thumbnailPath = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        thumbnailPath = `${user.id}/${timestamp}_thumb.${thumbExt}`;
        
        const { error: thumbUploadError } = await supabase.storage
          .from('product_thumbnails')
          .upload(thumbnailPath, thumbnailFile);

        if (thumbUploadError) throw new Error("Failed to upload the thumbnail image.");
      }

      // 3. Create Database Record
      const result = await createNoteRecord({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        level: formData.level,
        subjectId: formData.subjectId,
        contentUrl: mainFilePath,
        thumbnailUrl: thumbnailPath,
      });

      if (result.error) {
        // 🚨 ROLLBACK STRATEGY: Delete the uploaded files from Supabase if DB fails
        await supabase.storage.from('product_files').remove([mainFilePath]);
        if (thumbnailPath) await supabase.storage.from('product_thumbnails').remove([thumbnailPath]);
        throw new Error(result.error);
      }

      toast.dismiss();
      toast.success("Material published successfully!", {
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' }
      });
      
      router.push("/dashboard"); 
      
    } catch (error: unknown) {
      toast.dismiss();
      toast.error((error as Error).message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Material Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} disabled={loading}
            placeholder="e.g. Complete Organic Chemistry Summary"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Detailed Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} disabled={loading} rows={4}
            placeholder="What does this document cover? Why is it valuable?"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Price (KES)</label>
            <input required type="number" name="price" value={formData.price} onChange={handleChange} disabled={loading} min="0" step="1"
              placeholder="e.g. 500"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Academic Level</label>
            <select name="level" value={formData.level} onChange={handleChange} disabled={loading}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 appearance-none">
              <option value="HIGH_SCHOOL">High School</option>
              <option value="COLLEGE">College / University</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject Category</label>
            <select name="subjectId" value={formData.subjectId} onChange={handleChange} disabled={loading}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 appearance-none">
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        
        {/* Main Document Upload */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-emerald-700">
            <FileText className="w-6 h-6" />
            <h3 className="font-bold">Main Document</h3>
          </div>
          <p className="text-sm text-emerald-600 mb-4">The secure file buyers will receive after payment (.pdf, .zip, .docx).</p>
          <input required type="file" accept=".pdf,.doc,.docx,.zip,.mp4" onChange={(e) => setMainFile(e.target.files?.[0] || null)} disabled={loading}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer transition-colors disabled:opacity-60" />
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-indigo-700">
            <ImageIcon className="w-6 h-6" />
            <h3 className="font-bold">Cover Image (Optional)</h3>
          </div>
          <p className="text-sm text-indigo-600 mb-4">An eye-catching thumbnail to display on the marketplace (.jpg, .png).</p>
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} disabled={loading}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-colors disabled:opacity-60" />
        </div>

      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading}
          className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all gap-3">
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </>
          ) : (
            <>
              <UploadCloud className="w-6 h-6" />
              Publish Material to Marketplace
            </>
          )}
        </button>
      </div>
    </form>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { createNoteRecord } from "@/app/dashboard/upload/actions"; 

type Subject = {
  id: string;
  name: string;
};

interface UploadNoteFormProps {
  subjects: Subject[];
  userId: string;
}


export default function UploadNoteForm({ subjects, userId }: UploadNoteFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
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
    
    if (!mainFile || !thumbnailFile) {
      setError("Please select both a cover image and the main material file.");
      return;
    }

    setLoading(true);

    try {
      // 1. UPLOAD THUMBNAIL (Public Bucket)
      setLoadingText("Uploading cover image...");
      const thumbExt = thumbnailFile.name.split('.').pop();
      const thumbPath = `${userId}/${Date.now()}-thumb.${thumbExt}`;
      
      const { error: thumbErr } = await supabase.storage
        .from('marketplace-thumbnails')
        .upload(thumbPath, thumbnailFile);
        
      if (thumbErr) throw new Error(`Thumbnail Error: ${thumbErr.message}`);

      // Get the public URL for the thumbnail so it can be displayed instantly on the marketplace
      const { data: publicThumbData } = supabase.storage
        .from('marketplace-thumbnails')
        .getPublicUrl(thumbPath);

      // 2. UPLOAD MAIN FILE (Private Bucket)
      setLoadingText("Uploading main product file... This might take a moment.");
      const fileExt = mainFile.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}-product.${fileExt}`;
      
      const { error: fileErr } = await supabase.storage
        .from('marketplace-files')
        .upload(filePath, mainFile);

      if (fileErr) throw new Error(`File Error: ${fileErr.message}`);

      // 3. SAVE TO PRISMA DATABASE
      setLoadingText("Saving product details to marketplace...");
      const result = await createNoteRecord({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        level: formData.level,
        subjectId: formData.subjectId,
        authorId: userId,           
        contentUrl: filePath,       
        thumbnailUrl: publicThumbData.publicUrl, 
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setLoadingText("Success! Redirecting to your library...");
      
      setTimeout(() => {
        router.push("/dashboard/library");
      }, 2000);

    } catch (err) {
      // STRICT TYPESCRIPT FIX: No more 'any'. We check if it's a standard Error object.
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during upload.");
      }
    } finally {
      if (!success) setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 text-emerald-800 p-8 rounded-2xl border border-emerald-200 text-center space-y-4 shadow-sm">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-2xl font-black">Upload Complete!</h3>
        <p className="font-medium text-emerald-700">Your material is now live on the marketplace.</p>
        <p className="text-sm opacity-80 animate-pulse mt-4">Redirecting you to your library...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p>{error}</p>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Material Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} 
            placeholder="e.g. Complete Calculus II Summary Notes" 
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors outline-none" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows={4}
            placeholder="What does this material cover? Why should a student buy it?" 
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors outline-none resize-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Price (KES)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-500 font-bold sm:text-sm">KSh</span>
            </div>
            <input required type="number" min="0" step="50" name="price" value={formData.price} onChange={handleChange} 
              placeholder="0.00" 
              className="block w-full rounded-xl border border-slate-200 pl-14 pr-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors outline-none" />
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">Set to 0 for free materials.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject Category</label>
          <select required name="subjectId" value={formData.subjectId} onChange={handleChange} 
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors outline-none cursor-pointer">
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Academic Level</label>
          <select required name="level" value={formData.level} onChange={handleChange} 
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors outline-none cursor-pointer">
            <option value="HIGH_SCHOOL">High School</option>
            <option value="COLLEGE">College / University</option>
            <option value="GENERAL">General Academic</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8 space-y-8">
        
        {/* Cover Image Upload */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed">
          <label className="block text-sm font-bold text-slate-900 mb-1">Cover Image (Public)</label>
          <p className="text-xs text-slate-500 mb-4 font-medium">This is what buyers see on the marketplace (JPG, PNG).</p>
          <input required type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer transition-colors" />
        </div>

        {/* Main File Upload */}
        <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-200 border-dashed">
          <label className="block text-sm font-bold text-emerald-900 mb-1">Main Material File (Private & Secure)</label>
          <p className="text-xs text-emerald-600 mb-4 font-medium">Buyers will only get access to this file AFTER successful payment (ZIP, PDF, DOCX).</p>
          <input required type="file" accept=".pdf,.doc,.docx,.zip,.mp4" onChange={(e) => setMainFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer transition-colors" />
        </div>

      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading}
          className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:scale-100 transition-all">
          {loading ? (
            <span className="flex items-center gap-3">
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
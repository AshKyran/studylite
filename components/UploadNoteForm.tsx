// components/UploadNoteForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Subject = {
  id: string;
  name: string;
};

export default function UploadNoteForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // New state specifically for the file
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "COLLEGE",
    subjectId: subjects.length > 0 ? subjects[0].id : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Upload the actual file to Supabase Storage
      // We generate a unique filename so files with the same name don't overwrite each other
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('studylite-notes')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Get the permanent Public URL from Supabase
      const { data: { publicUrl } } = supabase.storage
        .from('studylite-notes')
        .getPublicUrl(filePath);

      // 3. Save everything to our Next.js API / Prisma Database
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contentUrl: publicUrl, // We dynamically inject the real file URL here
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save note to database");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      {error && <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}
      {success && <div className="p-4 text-sm text-green-700 bg-green-50 rounded-lg">File uploaded and published successfully! Redirecting...</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input required type="text" name="title" value={formData.title} onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea required name="description" value={formData.description} onChange={handleChange} rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select required name="subjectId" value={formData.subjectId} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Education Level</label>
          <select required name="level" value={formData.level} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
            <option value="HIGH_SCHOOL">High School</option>
            <option value="COLLEGE">College / University</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (KES)</label>
          <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
        </div>

        {/* THE REAL FILE UPLOAD INPUT */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Document (PDF, Word)</label>
          <input 
            required 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition">
        {loading ? "Uploading File & Publishing..." : "Upload & Publish Note"}
      </button>
    </form>
  );
}
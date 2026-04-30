// components/UploadNoteForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define the shape of the subjects we'll receive from the server
type Subject = {
  id: string;
  name: string;
};

export default function UploadNoteForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentUrl: "",
    price: "",
    level: "COLLEGE", // Default matching our Prisma Enum
    subjectId: subjects.length > 0 ? subjects[0].id : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload note");
      }

      setSuccess(true);
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        contentUrl: "",
        price: "",
        level: "COLLEGE",
        subjectId: subjects[0]?.id || "",
      });
      
      // Optionally redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while uploading.");
      }
    } finally {
      setLoading(false);
    }
  
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      {error && <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}
      {success && <div className="p-4 text-sm text-green-700 bg-green-50 rounded-lg">Note published successfully! Redirecting...</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input required type="text" name="title" value={formData.title} onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="e.g., Advanced Calculus Exam Prep" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea required name="description" value={formData.description} onChange={handleChange} rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="What is covered in these notes?" />
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="0.00 for free" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content URL (PDF/Drive Link)</label>
          <input required type="url" name="contentUrl" value={formData.contentUrl} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="https://..." />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
        {loading ? "Publishing..." : "Publish Note"}
      </button>
    </form>
  );
}
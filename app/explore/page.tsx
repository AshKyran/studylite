// app/explore/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ExplorePage() {
  // Fetch all published notes, including the author's name and the subject
  const notes = await prisma.note.findMany({
    where: {
      isPublished: true,
    },
    include: {
      author: {
        select: { firstName: true, lastName: true, isVerified: true },
      },
      subject: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc", // Show newest first
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Study Materials
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            High-quality notes, past papers, and study guides from verified tutors and top students.
          </p>
        </div>

        {/* Marketplace Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No study materials have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200 flex flex-col">
                
                {/* Card Content */}
                <div className="p-5 flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {note.subject.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {note.level.replace("_", " ")}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                    {note.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {note.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Author</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      {note.author.firstName} {note.author.lastName}
                      {note.author.isVerified && (
                        <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-extrabold text-gray-900">
                      {note.price === 0 ? "FREE" : `KES ${note.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 pt-0 bg-gray-50">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                    {note.price === 0 ? "Download Now" : "Purchase Note"}
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
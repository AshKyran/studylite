// app/dashboard/library/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export default async function LibraryPage() {
  // 1. Authenticate User
  const cookieStore = await cookies();
  const token = cookieStore.get("studylite_session")?.value;

  if (!token) {
    redirect("/login");
  }

  let sessionData;
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    sessionData = payload;
  } catch (error) {
    redirect("/login");
  }

  // 2. Fetch the user's purchased notes with Author and Subject details
  const user = await prisma.user.findUnique({
    where: { id: sessionData.id as string },
    include: {
      purchasedNotes: {
        include: {
          author: {
            select: { firstName: true, lastName: true },
          },
          subject: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: "desc", // Assuming you want newest notes first, though a custom join table with 'purchasedAt' is better for true chronological sorting
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
            <p className="text-sm text-gray-500 mt-1">
              Access all your purchased and downloaded study materials here.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/explore" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              Browse More Notes
            </Link>
          </div>
        </div>

        {/* Library Grid */}
        {user.purchasedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Your library is empty</h3>
            <p className="mt-1 text-sm text-gray-500">You haven&apos;t added any study materials yet.</p>
            <Link 
              href="/explore" 
              className="mt-6 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.purchasedNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {note.subject.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {note.level.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    By {note.author.firstName} {note.author.lastName}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <a 
                    href={note.contentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Open Document
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
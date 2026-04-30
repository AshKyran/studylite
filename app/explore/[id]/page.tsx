// app/explore/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PurchaseCard from "@/components/PurchaseCard";

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
  // Fetch note by ID
  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { firstName: true, lastName: true, isVerified: true },
      },
      subject: {
        select: { name: true },
      },
    },
  });

  // Automatically trigger a 404 page if someone types a fake ID in the URL
  if (!note || !note.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <Link href="/explore" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Explore
          </Link>
        </nav>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column (Spans 2 cols on Desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  {note.subject.name}
                </span>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {note.level.replace("_", " ")}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                {note.title}
              </h1>
              
              <div className="flex items-center pt-6 border-t border-gray-100">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                  {note.author.firstName[0]}{note.author.lastName[0]}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    {note.author.firstName} {note.author.lastName}
                    {note.author.isVerified && (
                      <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Published on {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this material</h2>
              <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                {note.description}
              </div>
            </div>
          </div>

          {/* Sidebar / Checkout Column (Sticks to top on Desktop, falls to bottom on Mobile) */}
          <div className="lg:col-span-1">
            <PurchaseCard 
              noteId={note.id} 
              price={note.price} 
              contentUrl={note.contentUrl} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
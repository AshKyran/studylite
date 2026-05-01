import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function LibraryPage() {
  // 1. Authenticate User via Supabase
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  // 2. Fetch the user's purchased notes with Author and Subject details
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
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
          createdAt: "desc", 
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // 3. Generate Secure, Expiring Download Links (Signed URLs)
  // We map over the purchased notes and securely ask Supabase for a 1-hour access link
  const notesWithSecureLinks = await Promise.all(
    user.purchasedNotes.map(async (note) => {
      // Create a signed URL that expires in 3600 seconds (1 hour)
      const { data } = await supabase.storage
        .from('product_files')
        .createSignedUrl(note.contentUrl, 3600);

      return {
        ...note,
        secureDownloadUrl: data?.signedUrl || null,
      };
    })
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Library</h1>
          <p className="mt-2 text-slate-600 font-medium">
            Access all your purchased study materials, videos, and research papers securely.
          </p>
        </div>

        {notesWithSecureLinks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">📚</span>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Your library is empty</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You haven&apos;t purchased any materials yet. Explore the marketplace to find high-quality notes and projects.
            </p>
            <Link 
              href="/explore" 
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notesWithSecureLinks.map((note) => (
              <div 
                key={note.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
              >
                {/* Note: Since we added thumbnailUrl to the DB, you could eventually display it here 
                  using a public Supabase URL: 
                  https://[YOUR_SUPABASE_ID].supabase.co/storage/v1/object/public/product_thumbnails/[note.thumbnailUrl]
                */}
                
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {note.subject.name}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {note.level.replace("_", " ")}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                    {note.title}
                  </h3>
                  
                  <p className="text-sm font-medium text-slate-500 mb-4">
                    Author: {note.author.firstName} {note.author.lastName}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                  {note.secureDownloadUrl ? (
                    <a 
                      href={note.secureDownloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 shadow-sm text-sm font-bold rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Material
                    </a>
                  ) : (
                    <button disabled className="w-full px-4 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                      File Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
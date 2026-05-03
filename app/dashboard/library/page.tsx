// app/dashboard/library/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Download, Lock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

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

  // 3. Generate Secure, Expiring Download Links & Dynamic Image URLs
  const notesWithSecureLinks = await Promise.all(
    user.purchasedNotes.map(async (note) => {
      // Create a signed URL that expires in 3600 seconds (1 hour)
      const { data: secureLinkData } = await supabase.storage
        .from('product_files')
        .createSignedUrl(note.contentUrl, 3600);

      // UPGRADE: Dynamically generate the public URL for the thumbnail
      let dynamicThumbnailUrl = null;
      if (note.thumbnailUrl) {
        const { data: publicUrlData } = supabase.storage
          .from('product_thumbnails')
          .getPublicUrl(note.thumbnailUrl);
        dynamicThumbnailUrl = publicUrlData.publicUrl;
      }

      return {
        ...note,
        secureDownloadUrl: secureLinkData?.signedUrl || null,
        dynamicThumbnailUrl,
      };
    })
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Library</h1>
        <p className="mt-2 text-slate-500 font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500" />
          Securely access your purchased study materials and research papers.
        </p>
      </div>

      {notesWithSecureLinks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Your library is empty</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
            You haven&apos;t purchased any materials yet. Explore the marketplace to find high-quality notes and projects to boost your studies.
          </p>
          <Link 
            href="/explore" 
            className="px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-indigo-700 transition-colors"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notesWithSecureLinks.map((note) => (
            <div 
              key={note.id} 
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group"
            >
              {/* Display the Thumbnail */}
              {note.dynamicThumbnailUrl ? (
                <div className="w-full h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={note.dynamicThumbnailUrl} 
                    alt={note.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  <FileText className="w-12 h-12 text-slate-300" />
                </div>
              )}
              
              <div className="p-6 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {note.subject.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {note.level.replace("_", " ")}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 leading-snug mb-2 line-clamp-2">
                  {note.title}
                </h3>
                
                <p className="text-sm font-medium text-slate-500 mb-4">
                  By {note.author.firstName} {note.author.lastName}
                </p>
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
                {note.secureDownloadUrl ? (
                  <a 
                    href={note.secureDownloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Material
                  </a>
                ) : (
                  <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed text-sm">
                    <Lock className="w-4 h-4" /> File Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
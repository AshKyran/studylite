// app/dashboard/upload/page.tsx
import prisma from "@/lib/prisma";
import UploadNoteForm from "@/components/UploadNoteForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  // Ensure the user is authenticated before even showing the page
  const cookieStore = await cookies();
  const token = cookieStore.get("studylite_session")?.value;

  if (!token) {
    redirect("/login");
  }

  // Fetch subjects securely on the server
  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }, // Alphabetical order for the dropdown
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Study Material</h1>
          <p className="mt-2 text-sm text-gray-500">
            Share your knowledge and earn. Ensure your content is high quality.
          </p>
        </div>

        {/* Inject our isolated Client Component */}
        <UploadNoteForm subjects={subjects} />
      </div>
    </div>
  );
}
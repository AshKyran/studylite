// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export default async function DashboardPage() {
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

  // Fetch the user, their wallet, AND order their created notes by newest first
  const user = await prisma.user.findUnique({
    where: { id: sessionData.id as string },
    include: { 
      wallet: true,
      notesCreated: {
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              You are signed in as a <span className="font-semibold text-blue-600">{user.role}</span>
              {/* Added a Verified badge if they are an approved Tutor/Researcher */}
              {user.isVerified && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </p>
          </div>
          
          <LogoutButton />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Wallet Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Available Balance</h2>
              <p className="text-4xl font-extrabold text-gray-900 mt-2">
                KES {user.wallet?.balance.toFixed(2) || "0.00"}
              </p>
            </div>
            <button className="mt-6 w-full rounded-lg bg-blue-50 py-2 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition">
              Withdraw Funds
            </button>
          </div>

          {/* Uploaded Notes Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Study Materials</h2>
              <Link 
                href="/dashboard/upload" 
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition"
              >
                + Upload New
              </Link>
            </div>

            {/* Check if they have any notes, if not, show the empty state */}
            {user.notesCreated.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">You haven't uploaded any notes yet.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {user.notesCreated.map((note) => (
                  <div key={note.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {note.level.replace("_", " ")} • KES {note.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${note.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {note.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <a href={note.contentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
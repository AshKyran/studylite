// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export default async function DashboardOverview() {
  // 1. Verify Session
  const cookieStore = await cookies();
  const token = cookieStore.get("studylite_session")?.value;

  if (!token) redirect("/login");

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    userId = payload.id as string;
  } catch (error) {
    redirect("/login");
  }

  // 2. Fetch User Data Concurrently for Maximum Performance
  const [user, recentPurchases, myUploads] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    }),
    prisma.note.findMany({
      where: { purchasers: { some: { id: userId } } },
      orderBy: { createdAt: "desc" },
      take: 3, // Only show the 3 most recent
      include: { subject: { select: { name: true } } },
    }),
    prisma.note.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-gray-500 mt-1">Here is what is happening with your account today.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Stat */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Wallet Balance</h2>
            <span className="text-blue-600 bg-blue-50 p-2 rounded-lg">💳</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-sm font-semibold text-gray-600">KES</span>
            <span className="text-3xl font-extrabold text-gray-900">
              {user.wallet?.balance.toFixed(2) || "0.00"}
            </span>
          </div>
          <Link href="/dashboard/wallet" className="text-sm text-blue-600 font-medium mt-4 hover:underline">
            Top up funds →
          </Link>
        </div>

        {/* Library Stat */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Materials Owned</h2>
            <span className="text-green-600 bg-green-50 p-2 rounded-lg">📚</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {recentPurchases.length > 0 ? recentPurchases.length : "0"}
          </div>
          <Link href="/dashboard/library" className="text-sm text-blue-600 font-medium mt-4 hover:underline">
            View library →
          </Link>
        </div>

        {/* Uploads Stat */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Materials Uploaded</h2>
            <span className="text-purple-600 bg-purple-50 p-2 rounded-lg">📤</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {myUploads.length}
          </div>
          <Link href="/dashboard/upload" className="text-sm text-blue-600 font-medium mt-4 hover:underline">
            Upload new →
          </Link>
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Purchases List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Additions</h3>
          </div>
          <div className="divide-y divide-gray-100 p-2">
            {recentPurchases.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No materials purchased yet.</p>
            ) : (
              recentPurchases.map((note) => (
                <div key={note.id} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{note.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{note.subject.name}</p>
                  </div>
                  <a href={note.contentUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md">
                    Open
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Your Uploads List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Your Uploads</h3>
          </div>
          <div className="divide-y divide-gray-100 p-2">
            {myUploads.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">You haven&apos;t uploaded anything yet.</p>
            ) : (
              myUploads.map((note) => (
                <div key={note.id} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{note.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.isPublished ? "🟢 Published" : "🟡 Draft"} • KES {note.price}
                    </p>
                  </div>
                  <Link href={`/explore/${note.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md">
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
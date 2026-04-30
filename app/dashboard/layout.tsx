// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Secure the entire dashboard group
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

  // 2. Fetch the user's basic details for the profile section
  const user = await prisma.user.findUnique({
    where: { id: sessionData.id as string },
    select: { firstName: true, lastName: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* DESKTOP SIDEBAR 
        Hidden on mobile, fixed width on medium screens and up 
      */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
            Studylite<span className="text-gray-900">.</span>
          </Link>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors">
              <span className="mr-3">📊</span> Overview
            </Link>
            <Link href="/dashboard/library" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors">
              <span className="mr-3">📚</span> My Library
            </Link>
            <Link href="/dashboard/wallet" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors">
              <span className="mr-3">💳</span> Wallet
            </Link>
            <Link href="/dashboard/upload" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors">
              <span className="mr-3">📤</span> Upload Note
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-200">
          {/* We will build the actual logout API later, this just redirects to login for now */}
          <Link href="/login" className="flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <span className="mr-3">🚪</span> Sign Out
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA 
        Takes up remaining space, scrolls independently 
      */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION 
        Visible only on small screens, sticks to the bottom 
      */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 safe-area-pb">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">📊</span>
          <span className="text-[10px] font-medium">Overview</span>
        </Link>
        <Link href="/dashboard/library" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">📚</span>
          <span className="text-[10px] font-medium">Library</span>
        </Link>
        <Link href="/dashboard/wallet" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">💳</span>
          <span className="text-[10px] font-medium">Wallet</span>
        </Link>
        <Link href="/dashboard/upload" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">📤</span>
          <span className="text-[10px] font-medium">Upload</span>
        </Link>
      </nav>

    </div>
  );
}
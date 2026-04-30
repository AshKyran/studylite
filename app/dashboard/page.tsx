// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import Link from "next/link";

// Pull the secret key from the environment
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export default async function DashboardPage() {
  // 1. Get the session cookie securely on the server
  const cookieStore = await cookies();
  const token = cookieStore.get("studylite_session")?.value;

  // 2. If no token exists, kick them back to login
  if (!token) {
    redirect("/login");
  }

  let sessionData;

  // 3. Verify the token hasn't been tampered with
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    sessionData = payload;
  } catch (error) {
    // If the token is expired or invalid, kick to login
    redirect("/login");
  }

  // 4. Fetch the absolute latest user data AND their wallet balance
  const user = await prisma.user.findUnique({
    where: { id: sessionData.id as string },
    include: { wallet: true }, // Pull the relational wallet data we created at registration
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              You are signed in as a <span className="font-semibold text-blue-600">{user.role}</span>
            </p>
          </div>
          
          {/* Quick Logout (We will build a proper logout API later, this just clears the cookie visually for now if they clear cache, but a real logout button is best) */}
          <Link 
            href="/" 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Wallet Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Available Balance</h2>
              <p className="text-4xl font-extrabold text-gray-900 mt-2">
                ${user.wallet?.balance.toFixed(2) || "0.00"}
              </p>
            </div>
            <button className="mt-6 w-full rounded-lg bg-blue-50 py-2 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition">
              Add Funds
            </button>
          </div>

          {/* Activity/Notes Placeholder Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div className="mt-4 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">No recent activity yet.</p>
              <Link 
                href="/explore" 
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Explore study materials &rarr;
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
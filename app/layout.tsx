import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

// This metadata helps with Google Search SEO
export const metadata: Metadata = {
  title: "Studylite | Master Your World",
  description: "Learn Chemistry, Math, Computer Science, and Biology in depth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex flex-col min-h-screen`}>
        
        {/* Navigation Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Studylite Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-extrabold text-blue-700 tracking-tight">
                  Studylite.
                </Link>
              </div>
              
              {/* Desktop Menu Links */}
              <nav className="hidden md:flex space-x-8">
                <Link href="/learn" className="text-gray-600 hover:text-blue-600 font-medium transition">Library</Link>
                <Link href="/tutors" className="text-gray-600 hover:text-blue-600 font-medium transition">Tutors</Link>
                <Link href="/exams" className="text-gray-600 hover:text-blue-600 font-medium transition">Exams</Link>
              </nav>

              {/* Auth & Wallet Buttons */}
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium hidden sm:block transition">
                  Log in
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                  Sign up
                </Link>
              </div>

            </div>
          </div>
        </header>

        {/* Main Content Area (This is where your homepage and other pages load) */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
            <p>&copy; {new Date().getFullYear()} Studylite. All rights reserved.</p>
            <div className="space-x-4">
              <Link href="/terms" className="hover:text-blue-600">Terms</Link>
              <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
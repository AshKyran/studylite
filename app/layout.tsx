import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 1. Production-grade Font Optimization
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// 2. High-Quality SEO Metadata
export const metadata: Metadata = {
  title: {
    template: "%s | Studylite Platform",
    default: "Studylite - Premium Academic & Research Ecosystem",
  },
  description: "Access advanced college notes, connect with verified academic researchers, find local tutors, and take online revision exams.",
  keywords: ["study notes", "tutors", "online exams", "academic research", "university", "high school revision"],
  authors: [{ name: "Studylite Inc." }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studylite.com", // Replace with your actual production URL
    title: "Studylite - Elevate your intellect.",
    description: "The all-in-one ecosystem for ambitious minds. Connect with verified tutors, access peer-reviewed notes, and conquer your next exam.",
    siteName: "Studylite",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studylite - Premium Academic Ecosystem",
    description: "Master your academic journey with premium notes, verified tutors, and rigorous testing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const cookieStore = await cookies();
  const token = cookieStore.get("studylite_session")?.value;
  const isLoggedIn = !!token;

  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        
        {/* Global Navigation */}
        <Navbar isLoggedIn={isLoggedIn} />
        
        {/* Main Content Area (flex-grow pushes footer to bottom) */}
        <div className="grow flex flex-col">
          {children}
        </div>

        {/* Global Footer */}
        <Footer />

      </body>
    </html>
  );
}
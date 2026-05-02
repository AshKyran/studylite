import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NavbarServer from "@/components/NavbarServer";
import "./globals.css";
import Footer from "@/components/Footer";
import { Suspense } from "react";

// 1. Optimized Font Loading (Prevents Layout Shift)
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// 2. Viewport Settings (Strict Next.js 15/16 format)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Crucial for preventing input zoom on iOS
};

// 3. Maximum Grade SEO & Social Sharing Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://studylite.com"), // Update with your actual domain
  title: {
    template: "%s | Studylite",
    default: "Studylite - Premium Academic Ecosystem",
  },
  description: "Access advanced college notes, connect with verified academic researchers, and take rigorous online assessments.",
  keywords: ["study notes", "tutors", "online exams", "research platform", "academic hub"],
  authors: [{ name: "Studylite Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studylite.com",
    siteName: "Studylite",
    title: "Studylite - Elevate your intellect.",
    description: "The global nexus for ambitious learners, elite educators, and pioneering researchers.",
    images: [
      {
        url: "/og-image.jpg", // Drop a 1200x630 image in your /public folder
        width: 1200,
        height: 630,
        alt: "Studylite Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studylite - Premium Academic Ecosystem",
    description: "Access advanced college notes, connect with verified academic researchers, and take rigorous online assessments.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

 
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen selection:bg-blue-200 selection:text-blue-900">
        
       <Suspense fallback={<header className="h-20 w-full bg-transparent fixed top-0 z-50 border-b border-transparent" />}>
          <NavbarServer />
      </Suspense>
        
        <main className="grow flex flex-col relative w-full">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}

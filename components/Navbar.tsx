// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Check scroll position on mount AND on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll(); // Run once immediately on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   // Close mobile menu when route changes
  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(closeTimer);
  }, [pathname]);


  const navLinks = [
    { name: "Marketplace", href: "/explore" },
    { name: "Find a Tutor", href: "/tutors" },
    { name: "Online Exams", href: "/tests" },
    { name: "Q&A", href: "/community" },
    { name: "Research", href: "/research" },
  ];

  // Robust dynamic colors ensuring legibility on both dark hero and white background
  const navBgClass = scrolled 
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-4 text-slate-900" 
    : "bg-transparent py-6 text-white";


  if (
    pathname?.startsWith("/dashboard") || 
    pathname?.startsWith("/explore") || 
    pathname?.startsWith("/tutors") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/community") ||
    pathname?.startsWith("/research") ||
    pathname?.startsWith("/tests") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/projects") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/messages") ||
    pathname?.startsWith("/notifications") ||
    pathname?.startsWith("/billing") ||
    pathname?.startsWith("/subscriptions") ||
    pathname?.startsWith("/support") ||
    pathname?.startsWith("/feedback") ||
    pathname?.startsWith("/terms") ||
    pathname?.startsWith("/privacy") ||
    pathname?.startsWith("/cookies") ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/contact") ||
    pathname?.startsWith("/careers") ||
    pathname?.startsWith("/blog") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/verify-email") ||
    pathname?.startsWith("/404") ||
    pathname?.startsWith("/500")
    
  ) {
    return null;
  }

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Studylite<span className="text-indigo-500">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium hover:text-indigo-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold hover:text-indigo-500 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button (Upgraded for Accessibility) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 text-slate-900">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col space-y-3">
              {isLoggedIn ? (
                <Link href="/dashboard" className="w-full flex justify-center items-center px-4 py-3.5 rounded-xl shadow-sm text-base font-bold text-white bg-slate-900 hover:bg-slate-800">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full flex justify-center items-center px-4 py-3.5 rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700">
                    Create Free Account
                  </Link>
                  <Link href="/login" className="w-full flex justify-center items-center px-4 py-3.5 border border-slate-200 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for glassmorphism and dynamic text color
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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

  // Dynamic colors based on scroll position (fixes the hidden text bug on the dark hero)
  const navBgClass = scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-4" : "bg-transparent py-6";
  const textColorClass = scrolled ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white";
  const brandColorClass = scrolled ? "text-slate-900" : "text-white";
  
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
    pathname?.startsWith("/forgot-password")
    
  ) {
    return null;
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className={`text-2xl font-black tracking-tight transition-colors ${brandColorClass}`}>
              Studylite<span className="text-indigo-500">.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors ${
                    isActive 
                      ? (scrolled ? "text-indigo-600" : "text-indigo-400") 
                      : textColorClass
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-bold transition-colors ${scrolled ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${brandColorClass}`}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl absolute w-full left-0 top-full">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-base font-bold ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col space-y-3 px-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="w-full flex justify-center items-center px-4 py-3.5 rounded-xl shadow-sm text-base font-bold text-white bg-slate-900 hover:bg-slate-800"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full flex justify-center items-center px-4 py-3.5 rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="w-full flex justify-center items-center px-4 py-3.5 border border-slate-200 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

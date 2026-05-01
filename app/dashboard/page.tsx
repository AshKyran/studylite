"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data structured exactly like your Prisma Schema
const mockUser = {
  firstName: "Denis",
  lastName: "K",
  role: "TUTOR",
  isVerified: true,
  wallet: {
    balance: 4500.50, // KES
  },
  purchasedNotes: [
    { id: "1", title: "Advanced Calculus II", subject: "Mathematics", level: "COLLEGE" },
    { id: "2", title: "Cellular Biology Notes", subject: "Biology", level: "HIGH_SCHOOL" },
  ],
  createdNotes: [
    { id: "3", title: "Quantum Physics 101", price: 1500, isPublished: true, purchases: 12 },
    { id: "4", title: "Organic Chemistry Basics", price: 800, isPublished: false, purchases: 0 },
  ]
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "LIBRARY" | "UPLOADS">("OVERVIEW");

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white text-xl font-bold">
                {mockUser.firstName[0]}{mockUser.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {mockUser.firstName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                  {mockUser.role}
                </span>
                {mockUser.isVerified && (
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl text-right shrink-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wallet Balance</p>
            <p className="text-xl font-extrabold text-slate-900">
              KES {mockUser.wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`grow sm:grow-0 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === "OVERVIEW" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("LIBRARY")}
            className={`grow sm:grow-0 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === "LIBRARY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Library
          </button>
          {(mockUser.role === "TUTOR" || mockUser.role === "RESEARCHER") && (
            <button
              onClick={() => setActiveTab("UPLOADS")}
              className={`grow sm:grow-0 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "UPLOADS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Uploads
            </button>
          )}
        </nav>

        {/* Tab Content Panels */}
        <main className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-100">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/explore" className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Explore Notes</h3>
                  <p className="text-sm text-slate-500 mt-1">Browse the marketplace</p>
                </Link>
                <Link href="/exams/generator" className="p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Generate Exam</h3>
                  <p className="text-sm text-slate-500 mt-1">Create a custom PDF</p>
                </Link>
                <button className="text-left p-4 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors group">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <h3 className="font-bold text-slate-900">Top Up Wallet</h3>
                  <p className="text-sm text-slate-500 mt-1">Add funds via M-Pesa</p>
                </button>
              </div>
            </div>
          )}

          {/* 2. LIBRARY TAB */}
          {activeTab === "LIBRARY" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Purchased Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockUser.purchasedNotes.map((note) => (
                  <div key={note.id} className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md capitalize">
                        {note.subject}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 grow">{note.title}</h3>
                    <button className="w-full py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors">
                      Read Note
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. UPLOADS TAB (Tutors/Researchers Only) */}
          {activeTab === "UPLOADS" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">My Uploaded Notes</h2>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                  + Upload New
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Title</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold">Price (KES)</th>
                      <th className="px-4 py-3 font-bold">Sales</th>
                      <th className="px-4 py-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockUser.createdNotes.map((note) => (
                      <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-semibold text-slate-900">{note.title}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                            note.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {note.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-600">{note.price.toLocaleString()}</td>
                        <td className="px-4 py-4 font-medium text-slate-600">{note.purchases}</td>
                        <td className="px-4 py-4">
                          <button className="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
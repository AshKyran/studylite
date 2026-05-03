// app/(explore)/explore/page.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { EducationLevel } from "@prisma/client";
import { FileText, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExplorePage(
  props: { searchParams: Promise<{ filter?: string; subject?: string }> }
) {
  // 1. Await searchParams properly
  const searchParams = await props.searchParams;
  
  // Our core platform split: High School vs Advanced
  const currentFilter = searchParams.filter === "HIGH_SCHOOL" ? "HIGH_SCHOOL" : "COLLEGE";

  const supabase = await createClient();

  // 2. Strictly type the query using Prisma's official Enums
  const levelCondition = currentFilter === "HIGH_SCHOOL" 
    ? { equals: EducationLevel.HIGH_SCHOOL } 
    : { in: [EducationLevel.COLLEGE, EducationLevel.GENERAL] };

  // 3. Fetch Published Products securely
  const dbProducts = await prisma.note.findMany({
    where: {
      isPublished: true,
      level: levelCondition,
      ...(searchParams.subject && { subjectId: searchParams.subject }), 
    },
    include: {
      author: {
        select: { firstName: true, lastName: true, role: true, qualification: true },
      },
      subject: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4. CRITICAL UPGRADE: Safely serialize Prisma Decimals to Numbers to prevent React Server Component crashes
  const products = dbProducts.map(product => ({
    ...product,
    price: Number(product.price)
  }));

  const formatCurrency = (amount: number) => {
    return amount === 0 
      ? "FREE" 
      : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Study Notes & Summaries
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Browse {currentFilter === "HIGH_SCHOOL" ? "high school revision materials" : "advanced college and university resources"}.
          </p>
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link 
              href={`/explore/${product.id}`} // Routes to your (explore)/[id]/page.tsx
              key={product.id} 
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col group overflow-hidden"
            >
              {/* Card Header/Thumbnail Area */}
              <div className="h-40 bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                <FileText className="w-12 h-12 text-indigo-200 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-indigo-700 uppercase tracking-wider border border-white/20 shadow-sm">
                  {product.subject.name}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {product.title}
                </h3>
                
                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                      By {product.author.firstName} {product.author.lastName[0]}.
                    </p>
                    {/* Show qualification if it's an advanced material */}
                    {currentFilter === "COLLEGE" && product.author.qualification && (
                      <p className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded inline-block">
                        {product.author.qualification}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-black ${product.price === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">No notes found</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            We couldn&apos;t find any published materials matching this criteria.
          </p>
        </div>
      )}
    </div>
  );
}
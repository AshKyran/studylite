import { PrismaClient, EducationLevel } from "@prisma/client"; // <-- Imported EducationLevel
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

const prisma = new PrismaClient();

// In Next.js 16, searchParams is asynchronous
export default async function ExplorePage(
  props: { searchParams: Promise<{ filter?: string; subject?: string }> }
) {
  const searchParams = await props.searchParams;
  
  // Our core platform split: High School vs Advanced (College/Research)
  const currentFilter = searchParams.filter === "HIGH_SCHOOL" ? "HIGH_SCHOOL" : "COLLEGE";

  const supabase = await createClient();

  // 1. FIXED: Strictly type the query using Prisma's official Enums
  const levelCondition = currentFilter === "HIGH_SCHOOL" 
    ? { equals: EducationLevel.HIGH_SCHOOL } 
    : { in: [EducationLevel.COLLEGE, EducationLevel.GENERAL] };

  // 2. Fetch Published Products securely
  const products = await prisma.note.findMany({
    where: {
      isPublished: true,
      level: levelCondition, // <-- This is now perfectly type-safe!
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

  // 3. Format Currency
  const formatCurrency = (amount: number) => {
    return amount === 0 ? "FREE" : new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  // 4. Generate Public Thumbnail URLs
  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/600x400/e2e8f0/475569?text=No+Cover+Image";
    const { data } = supabase.storage.from("product_thumbnails").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* THE CORE SPLIT HEADER */}
      <div className="bg-slate-900 text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Explore the Marketplace
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Find the exact study materials, research papers, and revision notes you need to excel.
          </p>

          {/* High School vs Advanced Toggle */}
          <div className="inline-flex bg-slate-800 rounded-full p-1 border border-slate-700 shadow-inner">
            <Link 
              href="/explore?filter=HIGH_SCHOOL"
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                currentFilter === "HIGH_SCHOOL" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              High School (KCSE)
            </Link>
            <Link 
              href="/explore?filter=COLLEGE"
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                currentFilter === "COLLEGE" 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              University & Research
            </Link>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {currentFilter === "HIGH_SCHOOL" ? "High School Materials" : "Advanced & Higher Education"}
          </h2>
          <span className="text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            {products.length} Results
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No materials found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any published materials in this category right now. Check back soon or switch categories!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                href={`/explore/${product.id}`} 
                key={product.id} 
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Product Thumbnail */}
                <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={getImageUrl(product.thumbnailUrl)} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subject Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                      {product.subject.name}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                        By {product.author.firstName} {product.author.lastName[0]}.
                      </p>
                      {/* Show qualification if it's an advanced material */}
                      {currentFilter === "COLLEGE" && product.author.qualification && (
                        <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded inline-block">
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
        )}
      </div>
    </div>
  );
}
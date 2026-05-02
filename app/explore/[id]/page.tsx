import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { initializeCheckout } from "./actions";


// In Next.js 16, params are asynchronous
export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const productId = params.id;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 1. Fetch the Product Details
  const product = await prisma.note.findUnique({
    where: { id: productId },
    include: {
      author: {
        select: { firstName: true, lastName: true, qualification: true, institution: true, role: true },
      },
      subject: {
        select: { name: true },
      },
    },
  });

  if (!product || !product.isPublished) {
    notFound(); // Triggers Next.js 404 page
  }

  // 2. Check if the logged-in user already owns this product
  let hasPurchased = false;
  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        purchasedNotes: {
          where: { id: productId },
          select: { id: true },
        },
      },
    });
    if (dbUser && dbUser.purchasedNotes.length > 0) {
      hasPurchased = true;
    }
    // Also prevent the author from buying their own product
    if (product.authorId === authUser.id) {
      hasPurchased = true; 
    }
  }

  // 3. Format Currency & Images
  const formatCurrency = (amount: number) => {
    return amount === 0 ? "FREE" : new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/800x500/e2e8f0/475569?text=No+Cover+Image";
    const { data } = supabase.storage.from("product_thumbnails").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Navigation */}
        <Link href="/explore" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: Image & Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="aspect-video w-full bg-slate-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getImageUrl(product.thumbnailUrl)} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-slate-900/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {product.subject.name}
                  </span>
                  <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {product.level.replace("_", " ")}
                  </span>
                </div>
              </div>
              
              <div className="p-8 sm:p-10">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">
                  {product.title}
                </h1>
                
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About this material</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Checkout & Author Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Checkout Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl sticky top-8">
              <div className="mb-6">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-2">Price</p>
                <p className={`text-4xl font-black ${product.price === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                  {formatCurrency(product.price)}
                </p>
              </div>

              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 text-sm font-bold flex items-center gap-3">
                    <span className="text-xl">✅</span> You already own this material.
                  </div>
                  <Link href="/dashboard/library" className="w-full flex justify-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all">
                    Go to My Library
                  </Link>
                </div>
              ) : !authUser ? (
                <Link href={`/login?next=/explore/${product.id}`} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                  Log in to Purchase
                </Link>
              ) : (
                <form action={initializeCheckout}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button type="submit" className="w-full flex justify-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                    {product.price === 0 ? "Add to Library (Free)" : "Proceed to Payment"}
                  </button>
                  <p className="text-center text-xs text-slate-400 font-medium mt-4 flex justify-center items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Secured by Paystack
                  </p>
                </form>
              )}
            </div>

            {/* Author Credibility Card */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-md text-white">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Author Credentials</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-black border border-blue-500/30">
                  {product.author.firstName[0]}{product.author.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-lg">{product.author.firstName} {product.author.lastName}</p>
                  <p className="text-blue-400 text-sm font-medium">{product.author.role}</p>
                </div>
              </div>
              
              {(product.author.qualification || product.author.institution) && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  {product.author.qualification && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500">🎓</span>
                      <p className="text-sm text-slate-300"><span className="font-bold text-white">Highest Qualification:</span><br/>{product.author.qualification}</p>
                    </div>
                  )}
                  {product.author.institution && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500">🏛️</span>
                      <p className="text-sm text-slate-300"><span className="font-bold text-white">Institution:</span><br/>{product.author.institution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
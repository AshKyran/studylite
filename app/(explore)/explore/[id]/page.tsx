// app/(explore)/[id]/page.tsx
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { initializeCheckout } from "./actions";
import { 
  ChevronLeft, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Lock, 
  Unlock, 
  ShoppingCart,
  FileText
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  // UPGRADE: Await params for Next.js 15
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
    notFound(); 
  }

  // UPGRADE: Safe Decimal Conversion
  const productPrice = Number(product.price);

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
    if (product.authorId === authUser.id) {
      hasPurchased = true; // Authors own their own work
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
      
      {/* Back Button */}
      <Link href="/explore" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-100">
                {product.subject.name}
              </span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-slate-200">
                {product.level.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              {product.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Secure File Preview Mock */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 relative">
              <FileText className="w-10 h-10 text-slate-300" />
              <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white p-1.5 rounded-lg shadow-sm">
                {hasPurchased ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {hasPurchased ? "Digital File Unlocked" : "Secure Digital Download"}
            </h3>
            <p className="text-slate-500 font-medium max-w-sm">
              {hasPurchased 
                ? "You own this material. You can access the full secure document in your library."
                : "The full document is encrypted and will be instantly delivered to your library upon purchase."}
            </p>
          </div>
        </div>

        {/* Purchase Sidebar (Right) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            {/* Payment Card */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2 relative z-10">Total Price</p>
              <p className="text-4xl font-black mb-8 relative z-10">
                {productPrice === 0 ? "FREE" : `KES ${productPrice.toLocaleString()}`}
              </p>

              {hasPurchased ? (
                <Link href="/dashboard/library" className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-base font-black text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-[0.98] relative z-10">
                  <Unlock className="w-5 h-5" /> Access in Library
                </Link>
              ) : (
                <form action={initializeCheckout} className="relative z-10">
                  <input type="hidden" name="productId" value={product.id} />
                  <button type="submit" className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] text-base font-black text-white bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-[0.98]">
                    <ShoppingCart className="w-5 h-5" /> Buy Now
                  </button>
                </form>
              )}
              
              {!hasPurchased && (
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 relative z-10">
                  <Lock className="w-3.5 h-3.5" /> Secured by Paystack
                </div>
              )}
            </div>

            {/* Author Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">About the Author</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl font-black border border-indigo-100">
                  {product.author.firstName[0]}{product.author.lastName[0]}
                </div>
                <div>
                  <p className="font-black text-lg text-slate-900 flex items-center gap-1.5">
                    {product.author.firstName} {product.author.lastName}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </p>
                  <p className="text-indigo-600 text-sm font-bold">{product.author.role}</p>
                </div>
              </div>
              
              {(product.author.qualification || product.author.institution) && (
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  {product.author.qualification && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 font-medium">
                        <span className="font-bold text-slate-900 block mb-0.5">Highest Qualification</span>
                        {product.author.qualification}
                      </p>
                    </div>
                  )}
                  {product.author.institution && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 font-medium">
                        <span className="font-bold text-slate-900 block mb-0.5">Institution</span>
                        {product.author.institution}
                      </p>
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
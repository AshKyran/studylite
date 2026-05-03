"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export async function initializeCheckout(formData: FormData) {
  const productId = formData.get("productId") as string;
  if (!productId) throw new Error("Product ID is missing.");

  // 1. Authenticate User securely on the server
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?next=/explore/${productId}`);
  }

  // Fetch the user's email from our DB (required by Paystack)
  const dbUser: { email: string | null } | null = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { email: true },
  });

  if (!dbUser) redirect("/login");

  // 2. Fetch the specific product and its Author's Financial Data
  const product = await prisma.note.findUnique({
    where: { id: productId },
    include: {
      author: {
        // We need the Subaccount ID they generated during Onboarding
        select: { id: true, paystackSubaccountCode: true } 
      }
    }
  });

  if (!product || !product.isPublished) {
    throw new Error("Product not found or has been unpublished.");
  }

  // Prevent an author from accidentally buying their own material
  if (product.authorId === authUser.id) {
    redirect("/dashboard/library");
  }

  // ==========================================
  // SCENARIO A: THE PRODUCT IS FREE
  // ==========================================
  if (product.price === 0) {
    // 1. Unlock the file directly in Prisma
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        purchasedNotes: {
          connect: { id: product.id }
        }
      }
    });

    // 2. Create a $0 Ledger entry for platform analytics
    await prisma.purchase.create({
      data: {
        userId: authUser.id,
        noteId: product.id,
        amount: 0,
        reference: `FREE_ACQ_${Date.now()}_${authUser.id.substring(0,5)}`
      }
    });

    // 3. Send them straight to their library to download it
    redirect("/dashboard/library");
  }

  // ==========================================
  // SCENARIO B: THE PRODUCT IS PAID
  // ==========================================
  
  // Paystack expects currency in its lowest denomination (Cents/Kobo/Cents). 
  // For KES, we multiply by 100.
  const amountInCents = Math.round(product.price * 100);

  // Build the highly secure Paystack Initialization Payload
  const paystackPayload = {
    email: dbUser.email,
    amount: amountInCents,
    currency: "KES",
    // Where they go after M-Pesa is successful
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/library?payment=processing`,
    
    // THIS IS THE FINANCIAL MAGIC: 
    // Passing this code tells Paystack to automatically route 97.5% of the money 
    // to the Creator, and leave your 2.5% in the main Platform account.
    subaccount: product.author.paystackSubaccountCode,
    
    // Webhook Metadata: 
    // Paystack will send this exact data back to our server in the background 
    // once the M-Pesa prompt succeeds, so our Webhook knows who to give the file to.
    metadata: {
      platform: "studylite",
      userId: authUser.id,
      productId: product.id,
      custom_fields: [
        {
          display_name: "Material Title",
          variable_name: "material_title",
          value: product.title
        }
      ]
    }
  };

  // Call the Paystack API from our Server (Your Secret Key is safe)
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paystackPayload),
  });

  const paystackData = await response.json();

  if (!response.ok || !paystackData.status) {
    console.error("Paystack Initialization Failed:", paystackData);
    throw new Error("Failed to initialize the secure payment gateway. Please try again.");
  }

  // Instantly push the user's browser to the M-Pesa / Card input screen
  redirect(paystackData.data.authorization_url);
}
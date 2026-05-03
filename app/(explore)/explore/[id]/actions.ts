// app/(explore)/[id]/actions.ts
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
    redirect(`/login?redirect=/${productId}`);
  }

  // Fetch the user's email from our DB (required by Paystack)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { email: true },
  });

  if (!dbUser || !dbUser.email) redirect("/login");

  // 2. Fetch the specific product and its Author's Financial Data
  const product = await prisma.note.findUnique({
    where: { id: productId },
    include: {
      author: {
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

  // UPGRADE: Securely handle Prisma Decimal to Number conversion
  const priceAsNumber = Number(product.price);
  
  if (priceAsNumber <= 0) {
    throw new Error("Free items do not require checkout.");
  }

  // 3. Build the Paystack Payload
  const paystackPayload = {
    email: dbUser.email,
    amount: Math.round(priceAsNumber * 100), // Paystack requires smallest unit (cents/kobo)
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/library?payment=processing`,
    
    // Split payment: routes 97.5% to the Creator, 2.5% platform fee
    ...(product.author.paystackSubaccountCode && {
      subaccount: product.author.paystackSubaccountCode,
    }),
    
    // Webhook Metadata: Crucial for backend fulfillment
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

  // 4. Initialize Paystack Transaction
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

  // Instantly redirect the user to the secure Paystack checkout page
  redirect(paystackData.data.authorization_url);
}
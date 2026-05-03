// app/(explore)/projects/[id]/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Strict TypeScript Interface for Paystack
interface PaystackPayload {
  email: string;
  amount: number;
  callback_url: string;
  metadata: {
    platform: string;
    userId: string;
    productId: string;
    productType: string;
  };
  subaccount?: string;
  transaction_charge?: number;
  bearer?: string;
}

export async function initializeProjectCheckout(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) throw new Error("Project ID is missing");

  // 1. Secure Authentication
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser || !authUser.email) {
    redirect(`/login?redirect=/explore/projects/${projectId}`);
  }

  // 2. Fetch the project and the author's subaccount for the payment split
  const project = await prisma.project.findUnique({
    where: { id: projectId, isPublished: true },
    include: {
      author: { select: { paystackSubaccountCode: true } },
    },
  });

  if (!project) throw new Error("Project not found");
  
  // UPGRADE: Safely convert Prisma Decimal to JS Number
  const priceAsNumber = Number(project.price);

  // Security check: We don't charge for free projects
  if (priceAsNumber <= 0) {
    throw new Error("This project is free and does not require checkout");
  }

  // Prepare Paystack Payload (Amount in Kobo/Cents)
  const amountInCents = Math.round(priceAsNumber * 100); 

  const payload: PaystackPayload = {
    email: authUser.email,
    amount: amountInCents,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/library?payment=processing`, 
    metadata: {
      platform: "studylite",       
      userId: authUser.id,
      productId: project.id,
      productType: "PROJECT",      
    },
  };

  // Apply the 97.5% Split (if the creator has a connected Paystack wallet)
  if (project.author.paystackSubaccountCode) {
    payload.subaccount = project.author.paystackSubaccountCode;
    // Let Paystack automatically handle the 2.5% platform fee dynamically via the subaccount config
  }

  // 3. Call Paystack API
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    console.error("Paystack Initialization Failed:", data);
    throw new Error("Failed to initialize secure checkout. Please try again.");
  }

  // Redirect the user to the Paystack Checkout URL
  redirect(data.data.authorization_url);
}
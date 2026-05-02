"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";



const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// 1. Define the strict TypeScript Interface to replace 'any'
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
  // These are optional because not every creator has set up their wallet yet
  subaccount?: string;
  transaction_charge?: number;
  bearer?: string;
}

export async function initializeProjectCheckout(projectId: string) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser || !authUser.email) {
    redirect("/login");
  }

  // Fetch the project and the author's subaccount for the payment split
  const project = await prisma.project.findUnique({
    where: { id: projectId, isPublished: true },
    include: {
      author: { select: { paystackSubaccountCode: true } },
    },
  });

  if (!project) throw new Error("Project not found");
  
  // Security check: We don't charge for free projects
  if (project.price === 0) throw new Error("This project is free and does not require checkout");

  // Prepare Paystack Payload (Amount in Kobo/Cents)
  const amountInCents = Math.round(project.price * 100); 

  // 2. Use the strict Interface here instead of 'any'
  const payload: PaystackPayload = {
    email: authUser.email,
    amount: amountInCents,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/explore/projects/${project.id}`, 
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
    payload.transaction_charge = Math.round(amountInCents * 0.025); // Studylite keeps 2.5%
    payload.bearer = "subaccount"; 
  }

  // Call Paystack API
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.status) {
    console.error("Paystack Error:", data);
    throw new Error("Payment initialization failed");
  }

  // Redirect the user to the Paystack secure checkout
  redirect(data.data.authorization_url);
}
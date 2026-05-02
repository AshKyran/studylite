"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Define the expected form data shape
type CommissionFormData = {
  tutorId: string;
  title: string;
  description: string;
  format: string;
  deadline: string; // ISO Date string
  offerAmount: number;
};

/**
 * STEP 1: Attempt to process the commission using existing Wallet Balance.
 * If they are short on funds, it returns the exact amount needed via Paystack.
 */
export async function processCommissionInitiation(formData: CommissionFormData) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Unauthorized");

  // Calculate the total cost including the 5% platform Escrow fee
  const platformFee = Math.round(formData.offerAmount * 0.05);
  const totalCost = formData.offerAmount + platformFee;

  // Fetch the user's current wallet balance
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { wallet: true }
  });

  if (!dbUser) throw new Error("User not found");

  const currentBalance = dbUser.wallet?.balance || 0;

  // SCENARIO A: Student needs to top up
  if (currentBalance < totalCost) {
    const amountNeeded = totalCost - currentBalance;
    return { 
      requiresPayment: true, 
      amountNeeded: amountNeeded,
      totalCost: totalCost
    };
  }

  // SCENARIO B: Student has enough funds. Process immediately.
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Lock the funds (Deduct from wallet)
      await tx.wallet.update({
        where: { userId: authUser.id },
        data: { balance: { decrement: totalCost } }
      });

      // 2. Create the Commission Request
      await tx.materialRequest.create({
        data: {
          title: formData.title,
          description: formData.description,
          format: formData.format,
          deadline: new Date(formData.deadline),
          offerAmount: formData.offerAmount,
          studentId: authUser.id,
          tutorId: formData.tutorId,
          status: "PENDING"
        }
      });
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to process commission: " + message);
  }
}

/**
 * STEP 2: If Paystack was triggered, this runs AFTER successful payment.
 * It verifies the payment, tops up the wallet, and creates the commission.
 */
export async function finalizeFundedCommission(formData: CommissionFormData, paystackReference: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Unauthorized");

  const platformFee = Math.round(formData.offerAmount * 0.05);
  const totalCost = formData.offerAmount + platformFee;

  // 1. Securely verify the transaction with Paystack's API
  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${paystackReference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    
    const paystackData = await verifyRes.json();
    
    if (!paystackData.status || paystackData.data.status !== "success") {
      throw new Error("Payment verification failed. The transaction was not successful.");
    }

    // Paystack amounts are in cents (kobo), so we divide by 100
    const topUpAmount = paystackData.data.amount / 100;

    // 2. Execute the Atomic Transaction
    await prisma.$transaction(async (tx) => {
      // A. Ensure user has a wallet
      const wallet = await tx.wallet.upsert({
        where: { userId: authUser.id },
        update: {},
        create: { userId: authUser.id, balance: 0 }
      });

      // B. Add the newly deposited funds, then immediately subtract the commission cost
      // (This perfectly balances out if they only paid the exact difference)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { 
          balance: { 
            increment: topUpAmount,
            decrement: totalCost 
          } 
        }
      });

      // C. Create the Commission Request
      await tx.materialRequest.create({
        data: {
          title: formData.title,
          description: formData.description,
          format: formData.format,
          deadline: new Date(formData.deadline),
          offerAmount: formData.offerAmount,
          studentId: authUser.id,
          tutorId: formData.tutorId,
          status: "PENDING"
        }
      });
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Funding Error:", error);
    throw new Error(message || "Failed to finalize funded commission.");
  }
}
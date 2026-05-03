// app/dashboard/wallet/top-up/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function verifyAndFundWallet(reference: string, userId: string) {
  if (!reference) {
    throw new Error("Missing transaction reference.");
  }

  // SECURITY FIX: Never trust the client for the userId. Fetch it securely here.
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser || authUser.id !== userId) {
    throw new Error("Unauthorized. You must be logged in to fund a wallet.");
  }

  try {
    // Prevent double-spend replay attacks
    const existingTx = await prisma.transaction.findUnique({ where: { reference } });
    if (existingTx) {
      throw new Error("This payment has already been processed.");
    }

    // 1. Verify the transaction directly with Paystack's API
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", 
    });
    
    const paystackData = await verifyRes.json();
    
    // 2. Ensure it was actually successful
    if (!paystackData.status || paystackData.data.status !== "success") {
      console.error("Paystack Verification Failed:", paystackData);
      throw new Error("Payment verification failed. The transaction was not successful.");
    }

    // Paystack amounts are in Kobo/Cents
    const topUpAmountKES = paystackData.data.amount / 100;

    // 3. Add funds securely via a Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // Upsert ensures that if a student doesn't have a wallet yet, one is created automatically
      await tx.wallet.upsert({
        where: { userId: authUser.id },
        update: { balance: { increment: topUpAmountKES } },
        create: { userId: authUser.id, balance: topUpAmountKES }
      });
      
      // Create the immutable audit log
      await tx.transaction.create({
        data: {
          userId: authUser.id,
          amount: topUpAmountKES,
          reference: reference, 
          type: "TOP_UP",
          description: "Wallet Top-up via Paystack"
        }
      });
    });

    // 4. Refresh the application state
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard");
    revalidatePath("/explore"); // Refresh marketplace so they can buy immediately

    return { success: true, amount: topUpAmountKES };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to finalize top-up.";
    console.error("Top-Up Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
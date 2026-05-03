// app/tutors/[id]/commission/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type CommissionFormData = {
  tutorId: string;
  title: string;
  description: string;
  format: string;
  deadline: string; 
  offerAmount: number;
};

/**
 * STEP 1: Attempt to process the commission using existing Wallet Balance.
 * If they are short on funds, it returns the exact amount needed via Paystack.
 */
export async function processCommissionInitiation(formData: CommissionFormData) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  if (error || !authUser) return { error: "Unauthorized. Please log in." };

  const platformFee = Math.round(formData.offerAmount * 0.05);
  const totalCost = formData.offerAmount + platformFee;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { wallet: true }
    });

    if (!dbUser) return { error: "User not found" };

    // UPGRADE: Safe Prisma Decimal to Number conversion
    const currentBalance = dbUser.wallet?.balance ? Number(dbUser.wallet.balance) : 0;

    // SCENARIO A: Student needs to top up
    if (currentBalance < totalCost) {
      const amountNeeded = totalCost - currentBalance;
      return { 
        requiresPayment: true, 
        amountNeeded: amountNeeded,
        totalCost: totalCost
      };
    }

    // SCENARIO B: Student already has enough funds. Process immediately!
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: authUser.id },
        data: { balance: { decrement: totalCost } }
      });

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

      await tx.transaction.create({
        data: {
          userId: authUser.id,
          amount: totalCost,
          type: "ESCROW_DEPOSIT",
          reference: `ESCROW_REQ_${Date.now()}_${authUser.id.substring(0,5)}`,
          description: `Escrow deposit for custom material: ${formData.title}`
        }
      });
    });

    revalidatePath("/dashboard/requests");
    return { success: true };

  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to initiate commission" };
  }
}

/**
 * STEP 2: Verify the Paystack Top-Up and finalize the commission.
 */
export async function verifyAndFundCommission(reference: string, formData: CommissionFormData) {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) return { error: "Unauthorized" };

  const platformFee = Math.round(formData.offerAmount * 0.05);
  const totalCost = formData.offerAmount + platformFee;

  try {
    // 1. Verify Paystack Payment
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store"
    });

    const paystackData = await verifyRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return { error: "Payment verification failed." };
    }

    const topUpAmount = paystackData.data.amount / 100;

    // 2. Execute the Atomic Transaction
    await prisma.$transaction(async (tx) => {
      // A. Ensure user has a wallet
      const wallet = await tx.wallet.upsert({
        where: { userId: authUser.id },
        update: {},
        create: { userId: authUser.id, balance: 0 }
      });

      // B. Add deposited funds, subtract total cost simultaneously
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

      // D. UPGRADE: Create Audit Trails for both the Top-up and the Escrow hold
      await tx.transaction.create({
        data: {
          userId: authUser.id,
          amount: topUpAmount,
          type: "TOP_UP",
          reference: reference,
          description: "Wallet Top-up via Paystack for Escrow"
        }
      });

      await tx.transaction.create({
        data: {
          userId: authUser.id,
          amount: totalCost,
          type: "ESCROW_DEPOSIT",
          reference: `ESCROW_REQ_${Date.now()}_${authUser.id.substring(0,5)}`,
          description: `Escrow deposit for custom material: ${formData.title}`
        }
      });
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
    
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error during payment verification" };
  }
}
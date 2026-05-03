// app/tutors/[id]/request/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

interface RequestPayload {
  tutorId: string;
  title: string;
  format: string;
  deadline: string;
  description: string;
  offerAmount: number;
}

export async function submitMaterialRequest(data: RequestPayload) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    return { error: "You must be logged in to make a request." };
  }

  // Calculate the total required to put into Escrow
  const platformFee = Math.round(data.offerAmount * 0.05);
  const totalRequired = data.offerAmount + platformFee;

  try {
    // 1. Validate the user's wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.id }
    });

    // UPGRADE: Handle Prisma Decimal securely for comparison
    const currentBalance = wallet ? Number(wallet.balance) : 0;

    if (currentBalance < totalRequired) {
      return { 
        error: `Insufficient funds. You need KES ${totalRequired.toLocaleString()} but your balance is KES ${currentBalance.toLocaleString()}. Please top up your wallet.` 
      };
    }

    // 2. Perform a Database Transaction (Ensure data consistency)
    await prisma.$transaction(async (tx) => {
      
      // A. Deduct funds from student's wallet (Moved to ESCROW)
      await tx.wallet.update({
        where: { userId: authUser.id },
        data: { balance: { decrement: totalRequired } }
      });

      // B. Create the Material Request
      await tx.materialRequest.create({
        data: {
          title: data.title,
          description: data.description,
          format: data.format,
          deadline: new Date(data.deadline),
          offerAmount: data.offerAmount,
          status: "PENDING",
          studentId: authUser.id,
          tutorId: data.tutorId,
        }
      });

      // C. UPGRADE: Log the escrow transaction so the student sees where their money went
      await tx.transaction.create({
        data: {
          userId: authUser.id,
          amount: totalRequired,
          type: "ESCROW_DEPOSIT",
          reference: `ESCROW_REQ_${Date.now()}_${authUser.id.substring(0,5)}`,
          description: `Escrow deposit for custom material: ${data.title}`
        }
      });
      
      // Note: We DO NOT add money to the Tutor's wallet yet! 
      // That happens ONLY when the status changes to "DELIVERED".
    });

    return { success: true };

  } catch (err: unknown) {
    console.error("Escrow/Request Error:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unexpected error occurred while processing your request." };
  }
}
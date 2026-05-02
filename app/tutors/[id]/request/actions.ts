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
    throw new Error("You must be logged in to make a request.");
  }

  // Calculate the total required to put into Escrow
  const platformFee = Math.round(data.offerAmount * 0.05);
  const totalRequired = data.offerAmount + platformFee;

  try {
    // 1. Validate the user's wallet balance (Assuming you have a Wallet model hooked to the User)
    const wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.id }
    });

    if (!wallet || wallet.balance < totalRequired) {
      throw new Error(`Insufficient funds. Please top up your wallet. You need KES ${totalRequired.toLocaleString()}`);
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
      
      // Note: We DO NOT add money to the Tutor's wallet yet! 
      // That happens ONLY when the status changes to "DELIVERED".
    });

    return { success: true };

  } catch (err: unknown) {
    console.error("Escrow/Request Error:", err);
    const errorMessage = err instanceof Error ? err.message : "An error occurred while processing your request.";
    throw new Error(errorMessage);
  }
}
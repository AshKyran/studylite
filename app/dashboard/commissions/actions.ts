"use server";

import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

/**
 * Updates the status of a material request.
 * If status is 'DELIVERED', it triggers the payout from Escrow.
 */
export async function updateCommissionStatus(requestId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error("Unauthorized");

  // 1. Fetch the request to verify ownership and amount
  const request = await prisma.materialRequest.findUnique({
    where: { id: requestId },
    select: { tutorId: true, offerAmount: true, status: true, studentId: true }
  });

  if (!request || request.tutorId !== authUser.id) {
    throw new Error("Request not found or unauthorized access.");
  }

  // 2. Prevent illegal state transitions
  if (request.status === "DELIVERED" || request.status === "REJECTED") {
    throw new Error("This commission is already closed.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      
      // A. Update the Request Status
      const updatedRequest = await tx.materialRequest.update({
        where: { id: requestId },
        data: { status: newStatus }
      });

      // B. ESCROW PAYOUT LOGIC: Only if status is DELIVERED
      if (newStatus === "DELIVERED") {
        await tx.wallet.update({
          where: { userId: authUser.id }, // The Creator
          data: { 
            balance: { increment: request.offerAmount } 
          }
        });
        
        // C. Record the Transaction for the Creator's history
        // (Assuming you have a Transaction model)
        /*
        await tx.transaction.create({
          data: {
            userId: authUser.id,
            amount: request.offerAmount,
            type: "COMMISSION_PAYOUT",
            description: `Payment for commission: ${requestId}`
          }
        });
        */
      }

      // D. REFUND LOGIC: If the Creator REJECTS the work
      if (newStatus === "REJECTED") {
        const platformFee = Math.round(request.offerAmount * 0.05);
        const totalRefund = request.offerAmount + platformFee;

        await tx.wallet.update({
          where: { userId: request.studentId },
          data: { balance: { increment: totalRefund } }
        });
      }

      revalidatePath("/dashboard/commissions");
      return { success: true, status: newStatus };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update commission.";
    console.error("Commission Update Error:", error);
    throw new Error(errorMessage);
  }
}
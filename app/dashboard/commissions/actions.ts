"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateCommissionStatus(requestId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error("Unauthorized");

  const request = await prisma.materialRequest.findUnique({
    where: { id: requestId },
    select: { tutorId: true, offerAmount: true, status: true, studentId: true }
  });

  if (!request || request.tutorId !== authUser.id) {
    throw new Error("Request not found or unauthorized access.");
  }

  if (request.status === "DELIVERED" || request.status === "REJECTED") {
    throw new Error("This commission is already closed.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      
      const updatedRequest = await tx.materialRequest.update({
        where: { id: requestId },
        data: { status: newStatus }
      });

      if (newStatus === "DELIVERED") {
        await tx.wallet.upsert({
          where: { userId: authUser.id },
          update: { balance: { increment: request.offerAmount } },
          create: { userId: authUser.id, balance: request.offerAmount }
        });
      }

      // B. ESCROW PAYOUT LOGIC: Only if status is DELIVERED
      if (newStatus === "DELIVERED") {
        await tx.wallet.update({
          where: { userId: authUser.id }, 
          data: { balance: { increment: request.offerAmount } }
        });
        
        // UNCOMMENTED AND READY:
        await tx.transaction.create({
          data: {
            userId: authUser.id,
            amount: request.offerAmount,
            type: "COMMISSION_PAYOUT",
            reference: `ESCROW_PAYOUT_${requestId}`, // <--- Generated unique reference
            description: `Payment for commission: ${requestId}`
          }
        });
      }

      if (newStatus === "REJECTED") {
        const platformFee = Math.round(request.offerAmount * 0.05);
        const totalRefund = request.offerAmount + platformFee;

        await tx.wallet.upsert({
          where: { userId: request.studentId },
          update: { balance: { increment: totalRefund } },
          create: { userId: request.studentId, balance: totalRefund }
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
// app/dashboard/commissions/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateCommissionStatus(requestId: string, newStatus: string, fileUrl?: string) {
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

  if (request.status === "DELIVERED" || request.status === "REJECTED" || request.status === "CANCELLED") {
    throw new Error("This commission is already closed.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Update the Request Status (and attach the delivered file URL if present)
      const updatedRequest = await tx.materialRequest.update({
        where: { id: requestId },
        data: { 
          status: newStatus,
          ...(fileUrl && { fileUrl }) // Only update fileUrl if it was passed
        }
      });

      // UPGRADE: Safely convert Decimal to Number for accurate math
      const offerAmountKES = Number(request.offerAmount);

      // 2. ESCROW PAYOUT LOGIC (Delivered)
      if (newStatus === "DELIVERED") {
        await tx.wallet.upsert({
          where: { userId: authUser.id },
          update: { balance: { increment: offerAmountKES } },
          create: { userId: authUser.id, balance: offerAmountKES }
        });
        
        await tx.transaction.create({
          data: {
            userId: authUser.id,
            amount: offerAmountKES,
            type: "COMMISSION_PAYOUT",
            reference: `ESCROW_PAYOUT_${requestId}_${Date.now()}`, 
            description: `Payment for commission: ${requestId}`
          }
        });
      }

      // 3. ESCROW REFUND LOGIC (Rejected)
      if (newStatus === "REJECTED") {
        const platformFee = offerAmountKES * 0.05;
        const totalRefund = offerAmountKES + platformFee;

        await tx.wallet.upsert({
          where: { userId: request.studentId },
          update: { balance: { increment: totalRefund } },
          create: { userId: request.studentId, balance: totalRefund }
        });

        await tx.transaction.create({
          data: {
            userId: request.studentId,
            amount: totalRefund,
            type: "REFUND",
            reference: `REFUND_${requestId}_${Date.now()}`,
            description: `Refund for declined commission: ${requestId}`
          }
        });
      }

      revalidatePath("/dashboard/commissions");
      revalidatePath("/dashboard/requests"); // Refresh the student's view too
      return { success: true, status: newStatus };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update commission.";
    console.error("Commission Update Error:", error);
    throw new Error(errorMessage);
  }
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Strict Types to banish `any`
interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: {
      platform?: string;
      userId?: string;
      productId?: string;
      productType?: "NOTE" | "PROJECT" | "SUBSCRIPTION";
    };
    customer?: {
      email: string;
    };
    plan?: {
      plan_code: string;
    };
    subscription_code?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Cryptographic Verification
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Safely parse the verified payload
    const event = JSON.parse(rawBody) as PaystackWebhookEvent;
    const data = event.data;

    // ==========================================
    // SCENARIO 1: SUCCESSFUL PAYMENT (Marketplace OR Subscription)
    // ==========================================
    if (event.event === "charge.success") {
      const amountPaid = data.amount / 100; 
      const reference = data.reference;
      
      const userId = data.metadata?.userId;
      const productType = data.metadata?.productType;

      if (!userId) {
        return NextResponse.json({ error: "Missing userId in metadata" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Prevent duplicate webhook processing
        const existingPurchase = await tx.purchase.findUnique({
          where: { reference: reference },
        });

        if (existingPurchase) return; // Already processed

        // --- BRANCH A: ONE-OFF MARKETPLACE PURCHASE ---
        if (productType === "NOTE" || productType === "PROJECT") {
          const productId = data.metadata?.productId;
          if (!productId) throw new Error("Missing productId");

          // Create ledger entry
          await tx.purchase.create({
            data: {
              userId: userId,
              amount: amountPaid,
              reference: reference,
              noteId: productType === "NOTE" ? productId : null,
              projectId: productType === "PROJECT" ? productId : null,
            },
          });

          // Give access to the file
          if (productType === "NOTE") {
            await tx.user.update({
              where: { id: userId },
              data: { purchasedNotes: { connect: { id: productId } } }
            });
          } else {
            await tx.user.update({
              where: { id: userId },
              data: { purchasedProjects: { connect: { id: productId } } }
            });
          }
        } 
        
        // --- BRANCH B: SUBSCRIPTION INITIALIZATION ---
        else if (productType === "SUBSCRIPTION") {
          // Update the user's subscription status
          await tx.user.update({
            where: { id: userId },
            data: {
              isSubscribed: true,
              paystackSubId: data.subscription_code, // Store so we can cancel it later if needed
            },
          });
        }
      });
    }

    // ==========================================
    // SCENARIO 2: RECURRING SUBSCRIPTION INVOICE (Money automatically deducted next month)
    // ==========================================
    if (event.event === "invoice.create" || event.event === "invoice.update") {
      if (data.status === "failed" && data.customer?.email) {
        await prisma.user.update({
          where: { email: data.customer.email },
          data: { isSubscribed: false },
        });
      }
    }

    // ==========================================
    // SCENARIO 3: SUBSCRIPTION CANCELED
    // ==========================================
    if (event.event === "subscription.disable") {
      if (data.customer?.email) {
        await prisma.user.update({
          where: { email: data.customer.email },
          data: { isSubscribed: false, paystackSubId: null },
        });
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
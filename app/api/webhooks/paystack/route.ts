import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

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
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing Paystack secret key" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as PaystackWebhookEvent;
    const data = event.data;

    if (event.event === "charge.success") {
      const amountPaid = data.amount / 100;
      const reference = data.reference;

      const userId = data.metadata?.userId;
      const productType = data.metadata?.productType;

      if (!userId) {
        return NextResponse.json(
          { error: "Missing userId in metadata" },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        const existingPurchase = await tx.purchase.findUnique({
          where: { reference },
        });

        if (existingPurchase) return;

        if (productType === "NOTE" || productType === "PROJECT") {
          const productId = data.metadata?.productId;
          if (!productId) throw new Error("Missing productId");

          await tx.purchase.create({
            data: {
              userId,
              amount: amountPaid,
              reference,
              noteId: productType === "NOTE" ? productId : null,
              projectId: productType === "PROJECT" ? productId : null,
            },
          });

          if (productType === "NOTE") {
            await tx.user.update({
              where: { id: userId },
              data: {
                purchasedNotes: { connect: { id: productId } },
              },
            });
          } else {
            await tx.user.update({
              where: { id: userId },
              data: {
                purchasedProjects: { connect: { id: productId } },
              },
            });
          }
        } else if (productType === "SUBSCRIPTION") {
          await tx.user.update({
            where: { id: userId },
            data: {
              isSubscribed: true,
              paystackSubId: data.subscription_code ?? null,
            },
          });
        }
      });
    }

    if (event.event === "invoice.create" || event.event === "invoice.update") {
      if (data.status === "failed" && data.customer?.email) {
        await prisma.user.update({
          where: { email: data.customer.email },
          data: { isSubscribed: false },
        });
      }
    }

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


// app/api/wallet/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { z } from "zod";

// 1. Zod Schema: Strict validation to prevent injection or invalid amounts
const InitializeTopUpSchema = z.object({
  amount: z.number()
    .min(10, "Minimum top-up is KES 10")
    .max(100000, "Maximum top-up exceeded"),
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  // Guard clause for missing environment variables
  if (!PAYSTACK_SECRET_KEY) {
    console.error("CRITICAL: PAYSTACK_SECRET_KEY is missing.");
    return NextResponse.json({ error: "Internal server configuration error." }, { status: 500 });
  }

  try {
    // 2. Authentication & Session Verification
    const cookieStore = cookies();
    const token = cookieStore.get("studylite_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Session missing." }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      userId = payload.id as string;
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized. Invalid session." }, { status: 401 });
    }

    // 3. Parse and Validate Request Body
    const body = await req.json();
    const validation = InitializeTopUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount } = validation.data;

    // 4. Fetch user email (Paystack strictly requires an email for initialization)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // 5. Initialize Paystack Transaction
    // Paystack requires the amount to be in the lowest currency subunit. For KES, multiply by 100.
    const amountInSubunits = Math.round(amount * 100);

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInSubunits,
        currency: "KES",
        // Metadata is CRITICAL. Your webhook will read this to know which user's wallet to credit.
        metadata: {
          userId: user.id,
          type: "WALLET_TOPUP"
        },
        // The URL Paystack redirects to after the user completes the payment modal
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet/verify`, 
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack Initialization Failed:", paystackData);
      return NextResponse.json(
        { error: "Payment gateway unavailable. Please try again later." },
        { status: 502 }
      );
    }

    // 6. Return the secure authorization URL to the client
    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Top-Up Initialization Error:", error);
    return NextResponse.json(
      { error: "An unexpected internal error occurred." },
      { status: 500 }
    );
  }
}
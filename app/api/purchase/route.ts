// app/api/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { z } from "zod";

const PurchaseSchema = z.object({
  noteId: z.string().min(1, "Note ID is required"),
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: NextRequest) {
  try {
    // 1. Verify User Session
    const cookieStore = await cookies();
    const token = cookieStore.get("studylite_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "You must be logged in to purchase materials." }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      userId = payload.id as string;
    } catch (err) {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 });
    }

    // 2. Validate Request Payload
    const body = await req.json();
    const validation = PurchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }

    const { noteId } = validation.data;

    // 3. Fetch Note, User Wallet, and verify if already purchased
    const [note, user] = await Promise.all([
      prisma.note.findUnique({ where: { id: noteId } }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          wallet: true,
          purchasedNotes: {
            where: { id: noteId },
            select: { id: true }
          }
        }
      })
    ]);

    if (!note || !note.isPublished) {
      return NextResponse.json({ error: "This material is no longer available." }, { status: 404 });
    }

    if (!user || !user.wallet) {
      return NextResponse.json({ error: "User or wallet not found." }, { status: 404 });
    }

    // Prevent double purchasing
    if (user.purchasedNotes.length > 0) {
      return NextResponse.json({ error: "You already own this material. Check your library." }, { status: 400 });
    }

    // Cannot buy your own notes
    if (note.authorId === userId) {
      return NextResponse.json({ error: "You cannot purchase your own material." }, { status: 400 });
    }

    // 4. Check Wallet Balance
    if (user.wallet.balance < note.price) {
      return NextResponse.json({ 
        error: `Insufficient funds. Note costs KES ${note.price.toFixed(2)}, but your balance is KES ${user.wallet.balance.toFixed(2)}. Please top up via Paystack.` 
      }, { status: 402 }); // 402 Payment Required
    }

    // 5. Execute ACID Transaction (Deduct Wallet & Grant Access)
    await prisma.$transaction(async (tx) => {
      // Deduct from buyer
      await tx.wallet.update({
        where: { userId: userId },
        data: { balance: { decrement: note.price } },
      });

      // Add to author's wallet (Taking a platform cut? Let's say platform takes 10%, author gets 90%)
      const authorCut = note.price * 0.90;
      await tx.wallet.update({
        where: { userId: note.authorId },
        data: { balance: { increment: authorCut } },
      });

      // Grant access to buyer
      await tx.user.update({
        where: { id: userId },
        data: {
          purchasedNotes: {
            connect: { id: noteId }
          }
        }
      });
    });

    // 6. Return Success
    return NextResponse.json({ 
      success: true, 
      message: "Purchase successful! The material is now in your library." 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Purchase API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your purchase." },
      { status: 500 }
    );
  }
}
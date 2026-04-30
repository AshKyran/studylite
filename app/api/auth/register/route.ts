// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

// Recreate the Transaction type safely to avoid the missing namespace export error
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { email, password, firstName, lastName, role } = body;

    // 1. Production Validation: Ensure all fields are present
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, firstName, lastName" },
        { status: 400 }
      );
    }

    // Email format validation (basic Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // 2. Check for existing users to prevent duplicate accounts
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    // 3. Security: Hash the password (Cost factor 12 is the production standard)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Database Transaction: Create User AND Wallet together
    // Using our custom TransactionClient type to satisfy Next.js strict builds
    const newUser = await prisma.$transaction(async (tx: TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          // Only allow specific roles, default to STUDENT to prevent privilege escalation
          role: role === "TUTOR" || role === "RESEARCHER" ? role : "STUDENT",
        },
      });

      // Initialize their financial wallet immediately
      await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0.0,
        },
      });

      return user;
    });

    // 5. Clean up the response (NEVER return the password hash to the client)
    const { passwordHash, ...safeUser } = newUser;

    return NextResponse.json(
      { 
        message: "Account created successfully", 
        user: safeUser 
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while creating the account" },
      { status: 500 }
    );
  }
}
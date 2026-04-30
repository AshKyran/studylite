// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, role } = body;

    // 1. Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, firstName, lastName" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // 2. Check for existing users
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // 3. Security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Database Transaction
    // Explicitly defining 'tx: any' solves the implicit-any TypeScript error.
    // The eslint-disable line ensures the strict Next.js linter doesn't block the build.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role: role === "TUTOR" || role === "RESEARCHER" ? role : "STUDENT",
        },
      });

      await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0.0,
        },
      });

      return user;
    });

    // 5. Clean up response
    const { passwordHash, ...safeUser } = newUser;

    return NextResponse.json(
      { 
        message: "Account created successfully", 
        user: safeUser 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while creating the account" },
      { status: 500 }
    );
  }
}
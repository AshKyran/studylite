// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

// Pull the secret key from the environment
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // We return generic "Invalid credentials" so hackers don't know if the email exists
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Create a Secure Session Token (JWT)
    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Keeps the user logged in for 7 days
      .sign(encodedKey);

    // 5. Set the Token in an HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("studylite_session", token, {
      httpOnly: true, // Crucial: Prevents JavaScript (XSS) from reading the cookie
      secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Available across the entire site
    });

    // 6. Return the user data (stripping out the password hash)
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json(
      { 
        message: "Logged in successfully",
        user: safeUser
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
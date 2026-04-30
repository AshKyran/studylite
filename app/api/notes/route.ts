// app/api/notes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
  try {
    // 1. Production Security Check: Verify JWT
    const cookieStore = await cookies();
    const token = cookieStore.get("studylite_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      userId = payload.id as string;
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    // 2. Parse incoming data based on your EXACT schema
    const body = await req.json();
    const { title, description, contentUrl, price, level, subjectId } = body;

    // 3. Strict Validation
    if (!title || !description || !contentUrl || !level || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, contentUrl, level, subjectId" },
        { status: 400 }
      );
    }

    // 4. Database Insertion maintaining Referential Integrity
    const newNote = await prisma.note.create({
      data: {
        title,
        description,
        contentUrl,
        price: parseFloat(price) > 0 ? parseFloat(price) : 0.0,
        level, // e.g., "HIGH_SCHOOL", "COLLEGE", "GENERAL"
        subjectId,
        authorId: userId,
        isPublished: true, // We can set this to false later if you want a review process
      },
    });

    return NextResponse.json(
      { message: "Study note created successfully", note: newNote },
      { status: 201 }
    );

  } catch (error) {
    console.error("Note Creation Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while creating the note." },
      { status: 500 }
    );
  }
}
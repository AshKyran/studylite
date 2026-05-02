// app/dashboard/upload/actions.ts
"use server";

import prisma from "@/lib/prisma";


export async function createNoteRecord(data: {
  title: string;
  description: string;
  price: number;
  level: "HIGH_SCHOOL" | "COLLEGE" | "GENERAL";
  subjectId: string;
  authorId: string;
  contentUrl: string;
  thumbnailUrl: string;
}) {
  try {
    const newNote = await prisma.note.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        level: data.level,
        subjectId: data.subjectId,
        authorId: data.authorId,
        contentUrl: data.contentUrl,
        thumbnailUrl: data.thumbnailUrl,
        isPublished: true, // You can make this false if you want an approval process later
      },
    });

    return { success: true, noteId: newNote.id };
  } catch (error) {
    console.error("Failed to insert note into DB:", error);
    return { error: "Database error. Failed to save product details." };
  }
}
"use server";

import { createClient } from "@/utils/supabase/server";
import { PrismaClient, EducationLevel } from "@prisma/client";
import { jsPDF } from "jspdf";

const prisma = new PrismaClient();

interface GeneratePdfPayload {
  subjectId: string;
  level: string;
  questionCount: number;
  includeMarkingScheme: boolean;
}

export async function generateExamPdf(data: GeneratePdfPayload) {
  // 1. Strict Security & Identity Check
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) throw new Error("Unauthorized access.");

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { email: true, isSubscribed: true, subscriptionPlan: true }
  });

  if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
    throw new Error("Premium subscription required to generate PDFs.");
  }

  // 2. Fetch the Subject and a pool of Questions
  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) throw new Error("Subject not found.");

  // Fetch questions matching the criteria. 
  // In a massive DB, you'd use raw SQL for ORDER BY RAND(). For safety here, we fetch a pool and shuffle.
  const questionPool = await prisma.question.findMany({
    where: {
      exam: {
        subjectId: data.subjectId,
        level: data.level as EducationLevel,
        isPublished: true,
      }
    },
    include: { options: true },
    take: 300, // Fetch up to 300 to create a randomized pool
  });

  if (questionPool.length === 0) {
    throw new Error("Not enough questions in the database for this configuration yet.");
  }

  // 3. Shuffle and slice the exact number requested
  const shuffled = questionPool.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, data.questionCount);

  // ==========================================
  // 4. PDF GENERATION ENGINE
  // ==========================================
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yOffset = margin;

  // --- HELPER: Add Watermark ---
  const addWatermark = () => {
    doc.setTextColor(230, 235, 240); // Very light grey/blue
    doc.setFontSize(45);
    doc.setFont("helvetica", "bold");
    // Diagonal watermark across the center
    doc.text(`STUDYLITE PREMIUM`, pageWidth / 2, pageHeight / 2 - 20, { angle: 45, align: "center", renderingMode: "fill" });
    doc.setFontSize(20);
    doc.text(`Licensed to: ${dbUser.email}`, pageWidth / 2, pageHeight / 2 + 10, { angle: 45, align: "center", renderingMode: "fill" });
    doc.setTextColor(0, 0, 0); // Reset to black for text
  };

  // --- HELPER: Check Pagination ---
  const checkPageBreak = (neededHeight: number) => {
    if (yOffset + neededHeight > pageHeight - margin) {
      doc.addPage();
      addWatermark();
      yOffset = margin;
    }
  };

  // INITIALIZE FIRST PAGE
  addWatermark();

  // HEADER
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`Custom Assessment: ${subject.name}`, margin, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Level: ${data.level.replace("_", " ")} | Questions: ${selectedQuestions.length}`, margin, yOffset);
  yOffset += 15;

  // PRINT QUESTIONS
  selectedQuestions.forEach((q, index) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    
    // Split long question text to fit within page bounds
    const questionLines = doc.splitTextToSize(`${index + 1}. ${q.text} (${q.marks} marks)`, pageWidth - margin * 2);
    checkPageBreak(questionLines.length * 6 + 10);
    
    doc.text(questionLines, margin, yOffset);
    yOffset += questionLines.length * 6 + 3;

    // Print Multiple Choice Options (if they exist)
    if (q.options.length > 0) {
      doc.setFont("helvetica", "normal");
      const labels = ["A", "B", "C", "D", "E"];
      q.options.forEach((opt, optIndex) => {
        const optText = doc.splitTextToSize(`${labels[optIndex]}. ${opt.text}`, pageWidth - margin * 2 - 10);
        checkPageBreak(optText.length * 6);
        doc.text(optText, margin + 5, yOffset);
        yOffset += optText.length * 6 + 2;
      });
    } else {
      // Leave space for written answers if it's not multiple choice
      yOffset += 20; 
    }
    yOffset += 5; // Space between questions
  });

  // ==========================================
  // 5. PRINT MARKING SCHEME (If requested)
  // ==========================================
  if (data.includeMarkingScheme) {
    doc.addPage();
    addWatermark();
    yOffset = margin;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red text to easily identify the marking scheme
    doc.text(`OFFICIAL MARKING SCHEME`, margin, yOffset);
    doc.setTextColor(0, 0, 0);
    yOffset += 15;

    selectedQuestions.forEach((q, index) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      checkPageBreak(15);
      doc.text(`Question ${index + 1}:`, margin, yOffset);
      yOffset += 6;

      doc.setFont("helvetica", "normal");
      
      // Identify correct option(s)
      const correctOptions = q.options.filter(o => o.isCorrect);
      if (correctOptions.length > 0) {
        correctOptions.forEach(opt => {
          const ansLines = doc.splitTextToSize(`Answer: ${opt.text}`, pageWidth - margin * 2);
          checkPageBreak(ansLines.length * 6);
          doc.text(ansLines, margin, yOffset);
          yOffset += ansLines.length * 6 + 2;
        });
      }

      // Print Explanation
      if (q.explanation) {
        const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, pageWidth - margin * 2);
        checkPageBreak(expLines.length * 6);
        doc.text(expLines, margin, yOffset);
        yOffset += expLines.length * 6 + 2;
      }
      yOffset += 5;
    });
  }

  // 6. Return as a Base64 String so the client can trigger a safe download
  const base64Pdf = doc.output('datauristring');
  const filename = `StudyLite_${subject.name}_${Date.now()}.pdf`;

  return { success: true, base64Pdf, filename };
}
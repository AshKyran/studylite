// app/(explore)/tests/generator/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { jsPDF } from "jspdf";
import { EducationLevel } from "@prisma/client";

interface GeneratePdfPayload {
  subjectId: string;
  level: string;
  questionCount: number;
  includeMarkingScheme: boolean;
}

export async function generateExamPdf(data: GeneratePdfPayload) {
  // 1. Strict Security & Identity Check
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return { error: "Unauthorized access. Please log in." };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { email: true, isSubscribed: true, subscriptionPlan: true }
    });

    if (!dbUser?.isSubscribed || dbUser.subscriptionPlan === "TRIAL_7_DAY") {
      return { error: "Premium subscription required to generate custom PDFs." };
    }

    // 2. Fetch the Subject and a pool of Questions
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) return { error: "Subject not found." };

    const questionPool = await prisma.question.findMany({
      where: {
        exam: {
          subjectId: data.subjectId,
          level: data.level as EducationLevel,
          isPublished: true
        }
      },
      include: { options: true },
      take: 100, 
    });

    if (questionPool.length < data.questionCount) {
      return { 
        error: `Not enough questions available. We only have ${questionPool.length} questions for this subject and level.` 
      };
    }

    // Shuffle and pick the requested amount
    const shuffled = questionPool.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, data.questionCount);

    // 3. Generate the PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yOffset = 20;

    const checkPageBreak = (requiredSpace: number) => {
      if (yOffset + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yOffset = margin + 10;
      }
    };

    // --- FRONT PAGE HEADER ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("STUDYLITE ASSESSMENT", margin, yOffset);
    doc.setTextColor(0, 0, 0);
    yOffset += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Subject: ${subject.name}`, margin, yOffset);
    yOffset += 8;
    doc.text(`Level: ${data.level.replace("_", " ")}`, margin, yOffset);
    yOffset += 8;
    doc.text(`Total Questions: ${data.questionCount}`, margin, yOffset);
    yOffset += 15;

    // --- RENDER QUESTIONS ---
    selectedQuestions.forEach((q, index) => {
      checkPageBreak(30);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const questionLines = doc.splitTextToSize(`${index + 1}. ${q.text} [${q.marks} marks]`, pageWidth - margin * 2);
      doc.text(questionLines, margin, yOffset);
      yOffset += questionLines.length * 6 + 4;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const labels = ["A", "B", "C", "D", "E"];
      q.options.forEach((opt, oIndex) => {
        const optionText = `${labels[oIndex] || "-"}. ${opt.text}`;
        const optionLines = doc.splitTextToSize(optionText, pageWidth - margin * 2 - 10);
        checkPageBreak(optionLines.length * 6);
        doc.text(optionLines, margin + 5, yOffset);
        yOffset += optionLines.length * 6 + 2;
      });

      yOffset += 6; // Spacing between questions
    });

    // --- RENDER MARKING SCHEME (If Requested) ---
    if (data.includeMarkingScheme) {
      doc.addPage();
      yOffset = 20;
      
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // Emerald 500
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
        
        const correctOptions = q.options.filter(o => o.isCorrect);
        if (correctOptions.length > 0) {
          correctOptions.forEach(opt => {
            const ansLines = doc.splitTextToSize(`Answer: ${opt.text}`, pageWidth - margin * 2);
            checkPageBreak(ansLines.length * 6);
            doc.text(ansLines, margin, yOffset);
            yOffset += ansLines.length * 6 + 2;
          });
        }

        if (q.explanation) {
          const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, pageWidth - margin * 2);
          checkPageBreak(expLines.length * 6);
          doc.text(expLines, margin, yOffset);
          yOffset += expLines.length * 6 + 2;
        }
        yOffset += 6;
      });
    }

    const base64Pdf = doc.output("datauristring");
    const filename = `StudyLite_${subject.name.replace(/\s+/g, '_')}_Test.pdf`;

    return { success: true, base64Pdf, filename };

  } catch (err: unknown) {
    console.error("PDF Generation Error:", err);
    return { error: "An unexpected error occurred while generating your PDF." };
  }
}
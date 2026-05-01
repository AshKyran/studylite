import { notFound } from "next/navigation";
import ExamPlayer from "./ExamPlayer";

export default async function TakeExamPage({ params }: { params: { id: string } }) {
  // In production: const exam = await prisma.exam.findUnique({ where: { id: params.id }, include: { questions: true } })
  
  // Mock Data for the Exam
  const exam = {
    id: params.id,
    title: "Molecular Biology: Cellular Respiration",
    durationMinutes: 45,
    questions: [
      {
        id: "q1",
        text: "Which of the following stages of cellular respiration produces the most ATP?",
        options: ["Glycolysis", "Krebs Cycle", "Electron Transport Chain", "Fermentation"],
      },
      {
        id: "q2",
        text: "What is the primary role of oxygen in aerobic respiration?",
        options: ["To combine with carbon to form CO2", "To act as the final electron acceptor", "To provide energy for glycolysis", "To break down glucose directly"],
      },
      {
        id: "q3",
        text: "Where does the Krebs cycle occur in a eukaryotic cell?",
        options: ["Cytoplasm", "Mitochondrial matrix", "Inner mitochondrial membrane", "Nucleus"],
      },
      {
        id: "q4",
        text: "During glycolysis, one molecule of glucose is broken down into two molecules of:",
        options: ["Pyruvate", "Lactic Acid", "Acetyl-CoA", "Citric Acid"],
      }
    ]
  };

  if (!exam) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ExamPlayer exam={exam} />
    </div>
  );
}
// app/tutors/guide/page.tsx
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Wallet, 
  ArrowRight, 
  ChevronLeft,
  CheckCircle2
} from "lucide-react";

export const metadata = {
  title: "How Escrow Works | StudyLite",
  description: "Learn how StudyLite protects your funds when hiring academic experts.",
};

export default function EscrowGuidePage() {
  const steps = [
    {
      icon: Lock,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "1. Request & Deposit",
      description: "When you commission a tutor, your payment is deducted from your wallet and placed into a secure StudyLite Escrow vault. The tutor sees that the project is fully funded, but they do not have the money yet."
    },
    {
      icon: FileCheck,
      color: "text-indigo-500",
      bgColor: "bg-indigo-100",
      title: "2. Work & Delivery",
      description: "The tutor accepts your request and completes the custom research, notes, or code. They upload the final deliverable files directly through the StudyLite secure platform."
    },
    {
      icon: Wallet,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      title: "3. Approval & Payout",
      description: "Once the files are delivered and you are satisfied, the escrow hold is released. The funds are instantly transferred to the tutor's wallet. If the tutor fails to deliver, you get a refund."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Back Navigation */}
      <Link 
        href="/tutors" 
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mr-3 group-hover:border-slate-300 group-hover:bg-slate-100 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Directory
      </Link>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          100% Secure Hiring
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          Never worry about paying for work you don&apos;t receive. StudyLite Escrow protects both students and tutors by locking funds until the job is done right.
        </p>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="p-8 md:p-10 flex flex-col items-center text-center group hover:bg-slate-50 transition-colors">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 ${step.bgColor} ${step.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ / Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" /> For Students
          </h3>
          <ul className="space-y-3 text-sm text-slate-300 font-medium">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              Your money is safe if the tutor ghosts you or fails to deliver by the deadline.
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              Tutors are motivated to provide high-quality work because their payout relies on successful delivery.
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              No hidden fees—the 5% platform escrow fee is calculated clearly at checkout.
            </li>
          </ul>
        </div>

        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-950 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" /> For Tutors
          </h3>
          <ul className="space-y-3 text-sm text-indigo-800 font-medium">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              You never have to chase clients for payment. The funds are verified and locked before you even start typing.
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              Guaranteed payout upon successful delivery of the agreed-upon materials through our portal.
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              Focus on researching and coding, not on payment disputes.
            </li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center pt-8">
        <Link 
          href="/tutors"
          className="inline-flex justify-center items-center gap-2 py-4 px-8 rounded-xl shadow-lg shadow-indigo-200 text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
        >
          Browse Verified Tutors <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

    </div>
  );
}
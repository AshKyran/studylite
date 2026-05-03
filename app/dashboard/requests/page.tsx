// app/dashboard/requests/page.tsx
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileQuestion,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type MoneyInput = Prisma.Decimal | number | string | bigint | null | undefined;
type PersonName = {
  firstName: string | null;
  lastName: string | null;
};

type RequestItem = Prisma.MaterialRequestGetPayload<{
  include: {
    tutor: { select: { firstName: true; lastName: true } };
    student: { select: { firstName: true; lastName: true } };
  };
}>;

function isDecimalLike(value: unknown): value is { toNumber: () => number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  );
}

function toNumber(value: MoneyInput): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (isDecimalLike(value)) {
    return value.toNumber();
  }

  return 0;
}

function normalizeCurrencyCode(code: string | null | undefined): string {
  const cleaned = (code ?? "KES").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(cleaned) ? cleaned : "KES";
}

function formatCurrency(amount: MoneyInput, currencyCode: string): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: normalizeCurrencyCode(currencyCode),
    maximumFractionDigits: 2,
  }).format(toNumber(amount));
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(date);
}

function isOverdue(deadline: Date | string | null | undefined, status: string): boolean {
  if (!deadline || status === "DELIVERED") return false;

  const date = deadline instanceof Date ? deadline : new Date(deadline);
  if (Number.isNaN(date.getTime())) return false;

  return date.getTime() < Date.now();
}

function getDisplayName(person: PersonName): string {
  const parts = [person.firstName, person.lastName].filter(
    (part): part is string => typeof part === "string" && part.trim().length > 0
  );

  return parts.join(" ").trim() || "Unknown user";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          <Clock className="h-3.5 w-3.5" /> Awaiting Action
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          <AlertCircle className="h-3.5 w-3.5" /> In Progress
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
      );
    case "REJECTED":
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
          <XCircle className="h-3.5 w-3.5" /> {status === "REJECTED" ? "Declined" : "Cancelled"}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {status}
        </span>
      );
  }
}

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, currency: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const isCreator = dbUser.role === "TUTOR" || dbUser.role === "RESEARCHER";

  const requests: RequestItem[] = await prisma.materialRequest.findMany({
    where: isCreator ? { tutorId: authUser.id } : { studentId: authUser.id },
    include: {
      tutor: { select: { firstName: true, lastName: true } },
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const currencyCode = dbUser.currency ?? "KES";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {isCreator ? "Commissioned Work" : "My Requests"}
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            {isCreator
              ? "Manage incoming project requests and track deliveries."
              : "Track the status of your custom notes, projects, and commissions."}
          </p>
        </div>

        {!isCreator && (
          <Link
            href="/tutors"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 active:scale-[0.98]"
          >
            Hire a Tutor <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => {
            const deadlineText = formatDate(req.deadline);
            const overdue = isOverdue(req.deadline, req.status);
            const otherParty = isCreator
              ? getDisplayName(req.student)
              : getDisplayName(req.tutor);

            return (
              <div
                key={req.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(req.status)}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {req.format}
                      </span>
                    </div>

                    <div>
                      <h3 className="mb-1 text-xl font-black text-slate-900">{req.title}</h3>
                      <p className="line-clamp-2 leading-relaxed text-sm text-slate-500">
                        {req.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                      <p>
                        <span className="text-slate-400">Escrow Amount:</span>{" "}
                        <span className="font-bold text-slate-900">
                          {formatCurrency(req.offerAmount, currencyCode)}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-400">Deadline:</span>{" "}
                        <span className={overdue ? "font-bold text-red-600" : "font-bold text-slate-900"}>
                          {deadlineText}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-400">
                          {isCreator ? "Requested by:" : "Assigned to:"}
                        </span>{" "}
                        <span className="font-bold text-slate-900">{otherParty}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 md:w-48">
                    <Link
                      href={`/dashboard/requests/${req.id}`}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                    >
                      View Details
                    </Link>

                    {isCreator && req.status === "PENDING" && (
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 active:scale-[0.98]"
                      >
                        Accept Job
                      </button>
                    )}

                    {isCreator && req.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 active:scale-[0.98]"
                      >
                        Deliver Files
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <FileQuestion className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-black text-slate-900">No active requests</h3>
          <p className="mx-auto mb-8 max-w-md font-medium text-slate-500">
            {isCreator
              ? "You have not received any commission requests from students yet."
              : "You have not requested any custom materials yet. Hire a tutor to get personalized help."}
          </p>
          {!isCreator && (
            <Link
              href="/tutors"
              className="inline-flex rounded-xl bg-indigo-600 px-8 py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 active:scale-[0.98]"
            >
              Browse Available Tutors
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
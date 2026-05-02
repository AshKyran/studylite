"use server";

import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// These will be generated in your Paystack Dashboard -> Plans
const PAYSTACK_PLANS = {
  MONTHLY: process.env.PAYSTACK_PLAN_MONTHLY,     // KES 100
  QUARTERLY: process.env.PAYSTACK_PLAN_QUARTERLY, // KES 250
  YEARLY: process.env.PAYSTACK_PLAN_YEARLY,       // KES 1000
};

export type PlanType = "TRIAL" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export async function processSubscription(planType: PlanType) {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser || !authUser.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { isSubscribed: true, subscriptionPlan: true },
  });

  if (currentUser?.isSubscribed && currentUser.subscriptionPlan !== "TRIAL_7_DAY") {
    throw new Error("You already have an active premium subscription.");
  }

  // ==========================================
  // SCENARIO A: THEY CLICKED "START FREE TRIAL"
  // ==========================================
  if (planType === "TRIAL") {
    // Check if they already had a trial to prevent abuse
    if (currentUser?.subscriptionPlan?.includes("TRIAL") || currentUser?.subscriptionPlan?.includes("EARLY_ADOPTER")) {
        throw new Error("You have already used your free trial. Please upgrade to continue.");
    }

    // Count early adopters
    const earlyAdopterCount = await prisma.user.count({
      where: {
        OR: [
          { isSubscribed: true },
          { trialEndsAt: { not: null } }
        ]
      }
    });

    const now = new Date();
    
    if (earlyAdopterCount < 100) {
      // THE VIP EARLY ADOPTER (3 Months, Full Access)
      const trialEnd = new Date(now.setMonth(now.getMonth() + 3));
      await prisma.user.update({
        where: { id: authUser.id },
        data: {
          isSubscribed: true,
          subscriptionPlan: "EARLY_ADOPTER_PRO", // Unrestricted
          trialEndsAt: trialEnd,
        },
      });
      redirect("/dashboard?success=vip_trial_activated");
    } else {
      // USER #101+ (7 Days, Restricted Access)
      const trialEnd = new Date(now.setDate(now.getDate() + 7));
      await prisma.user.update({
        where: { id: authUser.id },
        data: {
          isSubscribed: true,
          subscriptionPlan: "TRIAL_7_DAY", // <-- This is the key for gatekeeping!
          trialEndsAt: trialEnd,
        },
      });
      redirect("/dashboard?success=restricted_trial_activated");
    }
  }

  // ==========================================
  // SCENARIO B: THEY CLICKED A PAID TIER (100, 250, or 1000 KES)
  // ==========================================
  const planCode = PAYSTACK_PLANS[planType];
  if (!planCode) throw new Error("Misconfigured Paystack Plan");

  const payload = {
    email: authUser.email,
    amount: 10000, // Paystack ignores this if planCode is provided, but requires the field
    plan: planCode, 
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=subscribed`,
    metadata: {
      platform: "studylite",
      userId: authUser.id,
      productType: "SUBSCRIPTION",
      requestedPlan: planType, // "MONTHLY", "QUARTERLY", etc.
    },
  };

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.status) throw new Error("Payment initialization failed");

  redirect(data.data.authorization_url);
}
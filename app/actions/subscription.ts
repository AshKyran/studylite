// app/actions/subscription.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// These will be generated in your Paystack Dashboard -> Plans
const PAYSTACK_PLANS: Record<string, string | undefined> = {
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
    select: { isSubscribed: true, subscriptionPlan: true, trialEndsAt: true },
  });

  if (currentUser?.isSubscribed && currentUser.subscriptionPlan !== "TRIAL_7_DAY") {
    throw new Error("You already have an active premium subscription.");
  }

  // ==========================================
  // SCENARIO A: THEY CLICKED "START FREE TRIAL"
  // ==========================================
  if (planType === "TRIAL") {
    // Check if they already used their trial
    if (currentUser?.trialEndsAt) {
      throw new Error("You have already used your free trial.");
    }

    // Activate the 7-day trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        isSubscribed: true,
        subscriptionPlan: "TRIAL_7_DAY",
        trialEndsAt: trialEndDate,
      },
    });

    redirect("/dashboard?success=trial_started");
  }

  // ==========================================
  // SCENARIO B: THEY CLICKED A PAID TIER
  // ==========================================
  const planCode = PAYSTACK_PLANS[planType];
  if (!planCode) throw new Error(`Misconfigured Paystack Plan for ${planType}`);

  const payload = {
    email: authUser.email,
    // Provide a dummy amount; Paystack overrides this with the Plan's actual amount
    amount: 10000, 
    plan: planCode, 
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=subscribed`,
    metadata: {
      platform: "studylite",
      userId: authUser.id,
      productType: "SUBSCRIPTION",
      requestedPlan: planType, 
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
  if (!response.ok || !data.status) {
    console.error("Paystack Init Failed:", data);
    throw new Error("Payment initialization failed. Please try again.");
  }

  // Redirect to the Paystack secure checkout
  redirect(data.data.authorization_url);
}

// ==========================================
// FETCH SUBSCRIPTION STATUS SECURELY
// ==========================================
export async function getSubscriptionStatus() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { 
      isSubscribed: true, 
      subscriptionPlan: true, 
      trialEndsAt: true 
    },
  });

  if (!dbUser) return null;

  // Auto-revoke expired trials just in case the backend cron job missed it
  if (dbUser.subscriptionPlan === "TRIAL_7_DAY" && dbUser.trialEndsAt && new Date() > dbUser.trialEndsAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isSubscribed: false, subscriptionPlan: null }
    });
    return {
      isSubscribed: false,
      subscriptionPlan: null,
      trialEndsAt: dbUser.trialEndsAt,
    };
  }

  return dbUser;
}
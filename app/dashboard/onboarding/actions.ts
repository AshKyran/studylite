"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function completeCreatorOnboarding(data: {
  qualification: string;
  institution: string;
  address: string;
  currency: string;
  bankCode: string;
  accountNumber: string;
}) {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) return { error: "Unauthorized. Please log in." };

  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("Missing PAYSTACK_SECRET_KEY");
    return { error: "Payment gateway configuration error. Please contact support." };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { firstName: true, lastName: true, isProfileComplete: true }
    });

    if (!dbUser) return { error: "User not found in database." };
    if (dbUser.isProfileComplete) return { error: "Profile is already locked and complete." };

    // 2. Call Paystack to create the Subaccount
    const paystackRes = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: `${dbUser.firstName} ${dbUser.lastName} - Studylite`,
        settlement_bank: data.bankCode, 
        account_number: data.accountNumber, 
        percentage_charge: 2.5, 
        description: "Studylite Creator Subaccount"
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack Error:", paystackData);
      return { error: paystackData.message || "Failed to verify bank details with Paystack." };
    }

    const subaccountCode = paystackData.data.subaccount_code;

    // 3. Lock the profile and save the subaccount code in Prisma
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        qualification: data.qualification,
        institution: data.institution,
        address: data.address,
        currency: data.currency,
        paystackSubaccountCode: subaccountCode,
        isProfileComplete: true, // Locks the profile!
      },
    });

    return { success: true };

  } catch (error) {
    console.error("Onboarding Error:", error);
    return { error: "An unexpected error occurred during profile setup." };
  }
}
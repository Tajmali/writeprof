import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// /ref/[code] → redirects to /signup?ref=CODE
// This short URL is what users share: writeprof.com/ref/JOHNDOE

export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Validate the code exists
  const user = await prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { id: true },
  });

  if (!user) {
    // Invalid code — still send to signup, just without referral
    redirect("/signup");
  }

  redirect(`/signup?ref=${code.toUpperCase()}`);
}

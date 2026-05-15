import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: Record<string, string>, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        platformName: settingsMap.platform_name || "WriteProf",
        supportEmail: settingsMap.support_email || "support@writeprof.com",
        commissionRate: parseFloat(settingsMap.commission_rate || "20"),
        emergencyFee: parseFloat(settingsMap.emergency_fee || "5000"),
        maxRevisions: parseInt(settingsMap.max_revisions || "3"),
        minWithdrawal: parseFloat(settingsMap.min_withdrawal || "5000"),
        withdrawalFee: parseFloat(settingsMap.withdrawal_fee || "100"),
        maintenanceMode: settingsMap.maintenance_mode === "true",
        allowNewRegistrations: settingsMap.allow_new_registrations !== "false",
        allowNewOrders: settingsMap.allow_new_orders !== "false",
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();

    const updates: Record<string, string> = {};
    if (body.platformName !== undefined) updates.platform_name = body.platformName;
    if (body.supportEmail !== undefined) updates.support_email = body.supportEmail;
    if (body.commissionRate !== undefined) updates.commission_rate = body.commissionRate.toString();
    if (body.emergencyFee !== undefined) updates.emergency_fee = body.emergencyFee.toString();
    if (body.maxRevisions !== undefined) updates.max_revisions = body.maxRevisions.toString();
    if (body.minWithdrawal !== undefined) updates.min_withdrawal = body.minWithdrawal.toString();
    if (body.withdrawalFee !== undefined) updates.withdrawal_fee = body.withdrawalFee.toString();
    if (body.maintenanceMode !== undefined) updates.maintenance_mode = body.maintenanceMode.toString();
    if (body.allowNewRegistrations !== undefined) updates.allow_new_registrations = body.allowNewRegistrations.toString();
    if (body.allowNewOrders !== undefined) updates.allow_new_orders = body.allowNewOrders.toString();

    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return NextResponse.json({ success: true, data: { updated: Object.keys(updates).length } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

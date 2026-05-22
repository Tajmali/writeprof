import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + (process.env.JWT_SECRET || "writeprof-secret-key-change-in-production"))
    .digest("hex");
}

async function main() {
  console.log("🌱 Seeding WriteProf database (safe mode — never deletes existing data)...");

  // Create Admin (only if doesn't exist)
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@writeprof.com" } });
  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: "admin@writeprof.com",
        name: "WriteProf Admin",
        role: "ADMIN",
        emailVerified: true,
        passwordHash: hashPassword("Admin@WriteProf2026"),
        referralCode: "ADMIN001",
        wallet: { create: { balance: 0, totalEarned: 0, totalSpent: 0 } },
      },
    });
    console.log("✅ Admin created:", admin.email);
  } else {
    console.log("⏭️  Admin already exists, skipping");
  }

  // Create Writers
  const writerData = [
    { name: "Dr. Sarah K.", email: "sarah@writeprof.com", bio: "PhD holder with 10+ years in academic writing. Specialist in research papers, dissertations, and literature reviews.", specs: ["Academic Writing", "Research Papers", "Dissertations", "Literature Reviews"], rating: 4.9, completed: 847 },
    { name: "James O.", email: "james@writeprof.com", bio: "Award-winning copywriter with 8 years experience. Specializes in high-converting marketing copy and brand content.", specs: ["Copywriting", "Marketing Copy", "Blog Content", "Ad Copy"], rating: 4.8, completed: 1203 },
    { name: "Prof. Amara", email: "amara@writeprof.com", bio: "Published author and creative writing professor. Expert in literary analysis, creative essays, and storytelling.", specs: ["Creative Writing", "Essays", "Poetry", "Literary Analysis"], rating: 5.0, completed: 432 },
    { name: "Dr. Olivia R.", email: "olivia@writeprof.com", bio: "Medical doctor turned science writer. Specializes in medical content, clinical case studies, and health articles.", specs: ["Medical Writing", "Science Content", "Case Studies", "Lab Reports"], rating: 4.9, completed: 389 },
    { name: "Tunde A.", email: "tunde@writeprof.com", bio: "SEO expert and content strategist. Over 5 years creating content that ranks and converts.", specs: ["SEO Content", "Blog Posts", "Web Copy", "Content Strategy"], rating: 4.8, completed: 1567 },
    { name: "Michael C.", email: "michael@writeprof.com", bio: "MBA graduate specializing in business writing, financial reports, and technical documentation.", specs: ["Business Writing", "Technical Writing", "Reports", "Proposals"], rating: 4.7, completed: 621 },
  ];

  let writersCreated = 0;
  for (const wd of writerData) {
    const exists = await prisma.user.findUnique({ where: { email: wd.email } });
    if (!exists) {
      await prisma.user.create({
        data: {
          email: wd.email,
          name: wd.name,
          role: "WRITER",
          emailVerified: true,
          passwordHash: hashPassword("Writer@2026"),
          referralCode: wd.name.replace(/\s+/g, "").toUpperCase().slice(0, 6),
          wallet: { create: { balance: Math.floor(Math.random() * 50000) + 10000, totalEarned: wd.completed * 8000, totalSpent: 0 } },
          writerProfile: {
            create: {
              bio: wd.bio,
              specializations: wd.specs,
              languages: ["English"],
              status: "AVAILABLE",
              isApproved: true,
              isVerified: true,
              rating: wd.rating,
              totalOrders: wd.completed,
              completedOrders: wd.completed,
              onTimeDelivery: 97,
              performanceScore: 95,
            },
          },
        },
      });
      writersCreated++;
    }
  }
  console.log(`✅ Writers: ${writersCreated} created, ${writerData.length - writersCreated} already existed`);

  // Create sample clients
  const clientData = [
    { name: "Chioma Adeyemi", email: "chioma@example.com" },
    { name: "Marcus Thompson", email: "marcus@example.com" },
    { name: "Ibrahim Khalil", email: "ibrahim@example.com" },
    { name: "Fatima Bello", email: "fatima@example.com" },
    { name: "Dr. Emeka Nwosu", email: "emeka@example.com" },
  ];

  let clientsCreated = 0;
  for (const cd of clientData) {
    const exists = await prisma.user.findUnique({ where: { email: cd.email } });
    if (!exists) {
      await prisma.user.create({
        data: {
          email: cd.email,
          name: cd.name,
          role: "CLIENT",
          emailVerified: true,
          passwordHash: hashPassword("Client@2026"),
          referralCode: cd.name.replace(/\s+/g, "").toUpperCase().slice(0, 6),
          wallet: { create: { balance: 0, totalEarned: 0, totalSpent: 0 } },
        },
      });
      clientsCreated++;
    }
  }
  console.log(`✅ Clients: ${clientsCreated} created, ${clientData.length - clientsCreated} already existed`);

  // ⚠️ Blog posts are managed through the admin panel — NOT seeded here.
  // Deleting a post in the admin panel will permanently delete it.

  // Promo codes — only create if they don't exist
  const promoCodes = [
    { code: "WELCOME20", discount: 20, isPercent: true, maxUses: 1000, isActive: true },
    { code: "EMERGENCY50", discount: 50, isPercent: false, maxUses: 100, isActive: true },
    { code: "STUDENT10", discount: 10, isPercent: true, maxUses: 500, isActive: true },
  ];
  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }
  console.log("✅ Promo codes upserted");

  // System settings — only create if they don't exist
  const settings = [
    { key: "platform_commission", value: "20" },
    { key: "emergency_fee", value: "5000" },
    { key: "min_withdrawal", value: "5000" },
    { key: "maintenance_mode", value: "false" },
    { key: "max_active_orders_per_writer", value: "5" },
  ];
  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ System settings upserted");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin: admin@writeprof.com / Admin@WriteProf2026");
  console.log("Writer: sarah@writeprof.com / Writer@2026");
  console.log("Client: chioma@example.com / Client@2026");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

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
  console.log("🌱 Seeding WriteProf database...");

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.orderFile.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.session.deleteMany();
  await prisma.writerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Create Admin
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

  // Create Writers
  const writerData = [
    { name: "Dr. Sarah K.", email: "sarah@writeprof.com", bio: "PhD holder with 10+ years in academic writing. Specialist in research papers, dissertations, and literature reviews.", specs: ["Academic Writing", "Research Papers", "Dissertations", "Literature Reviews"], rating: 4.9, completed: 847 },
    { name: "James O.", email: "james@writeprof.com", bio: "Award-winning copywriter with 8 years experience. Specializes in high-converting marketing copy and brand content.", specs: ["Copywriting", "Marketing Copy", "Blog Content", "Ad Copy"], rating: 4.8, completed: 1203 },
    { name: "Prof. Amara", email: "amara@writeprof.com", bio: "Published author and creative writing professor. Expert in literary analysis, creative essays, and storytelling.", specs: ["Creative Writing", "Essays", "Poetry", "Literary Analysis"], rating: 5.0, completed: 432 },
    { name: "Dr. Olivia R.", email: "olivia@writeprof.com", bio: "Medical doctor turned science writer. Specializes in medical content, clinical case studies, and health articles.", specs: ["Medical Writing", "Science Content", "Case Studies", "Lab Reports"], rating: 4.9, completed: 389 },
    { name: "Tunde A.", email: "tunde@writeprof.com", bio: "SEO expert and content strategist. Over 5 years creating content that ranks and converts.", specs: ["SEO Content", "Blog Posts", "Web Copy", "Content Strategy"], rating: 4.8, completed: 1567 },
    { name: "Michael C.", email: "michael@writeprof.com", bio: "MBA graduate specializing in business writing, financial reports, and technical documentation.", specs: ["Business Writing", "Technical Writing", "Reports", "Proposals"], rating: 4.7, completed: 621 },
  ];

  for (const wd of writerData) {
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
            status: Math.random() > 0.3 ? "AVAILABLE" : "BUSY",
            isApproved: true,
            isVerified: true,
            rating: wd.rating,
            totalOrders: wd.completed + Math.floor(Math.random() * 50),
            completedOrders: wd.completed,
            onTimeDelivery: 95 + Math.floor(Math.random() * 5),
            performanceScore: 90 + Math.floor(Math.random() * 10),
          },
        },
      },
    });
  }
  console.log("✅ Writers created:", writerData.length);

  // Create sample clients
  const clientData = [
    { name: "Chioma Adeyemi", email: "chioma@example.com" },
    { name: "Marcus Thompson", email: "marcus@example.com" },
    { name: "Ibrahim Khalil", email: "ibrahim@example.com" },
    { name: "Fatima Bello", email: "fatima@example.com" },
    { name: "Dr. Emeka Nwosu", email: "emeka@example.com" },
  ];

  const clients = [];
  for (const cd of clientData) {
    const client = await prisma.user.create({
      data: {
        email: cd.email,
        name: cd.name,
        role: "CLIENT",
        emailVerified: true,
        passwordHash: hashPassword("Client@2026"),
        referralCode: cd.name.replace(/\s+/g, "").toUpperCase().slice(0, 6),
        wallet: { create: { balance: Math.floor(Math.random() * 20000), totalEarned: 0, totalSpent: Math.floor(Math.random() * 100000) + 10000 } },
      },
    });
    clients.push(client);
  }
  console.log("✅ Clients created:", clients.length);

  // Create sample blog posts
  const blogPosts = [
    {
      slug: "how-to-write-essay-in-2-hours",
      title: "How to Write a Compelling Essay in Under 2 Hours",
      excerpt: "When time is running out, you need a system. Here's the exact framework our top writers use to produce high-quality essays in hours, not days.",
      content: "Full article content here...",
      category: "Urgent Writing Help",
      tags: ["Essay Writing", "Speed Writing", "Academic"],
      author: "Dr. Sarah K.",
      readTime: 7,
      isPublished: true,
      views: 12400,
    },
    {
      slug: "apa-mla-citation-guide-2026",
      title: "APA vs MLA vs Chicago: The Complete Citation Guide for 2026",
      excerpt: "Getting citations wrong can cost you marks or credibility. This complete guide covers every citation style with examples.",
      content: "Full article content here...",
      category: "Academic Tips",
      tags: ["APA", "MLA", "Citations"],
      author: "Prof. Amara",
      readTime: 12,
      isPublished: true,
      views: 24500,
    },
    {
      slug: "copywriting-that-converts",
      title: "7 Copywriting Formulas That Convert Like Crazy in 2026",
      excerpt: "Great copy doesn't happen by accident. These battle-tested copywriting frameworks have generated millions in revenue.",
      content: "Full article content here...",
      category: "Copywriting",
      tags: ["Copywriting", "Marketing", "Conversion"],
      author: "James O.",
      readTime: 10,
      isPublished: true,
      views: 15200,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }
  console.log("✅ Blog posts created:", blogPosts.length);

  // Promo codes
  await prisma.promoCode.createMany({
    data: [
      { code: "WELCOME20", discount: 20, isPercent: true, maxUses: 1000, isActive: true },
      { code: "EMERGENCY50", discount: 50, isPercent: false, maxUses: 100, isActive: true },
      { code: "STUDENT10", discount: 10, isPercent: true, maxUses: 500, isActive: true },
    ],
  });
  console.log("✅ Promo codes created");

  // System settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "platform_commission", value: "20" },
      { key: "emergency_fee", value: "5000" },
      { key: "min_withdrawal", value: "5000" },
      { key: "maintenance_mode", value: "false" },
      { key: "max_active_orders_per_writer", value: "5" },
    ],
  });
  console.log("✅ System settings created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin: admin@writeprof.com / Admin@WriteProf2026");
  console.log("Writer: sarah@writeprof.com / Writer@2026");
  console.log("Client: chioma@example.com / Client@2026");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

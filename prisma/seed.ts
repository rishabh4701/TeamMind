// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Create Users ---
  const users = [
    { email: "alice@a.com", password: "123456", name: "Alice", teamId: "A-Team" },
    { email: "bob@b.com", password: "123456", name: "Bob", teamId: "B-Team" },
    { email: "charlie@c.com", password: "123456", name: "Charlie", teamId: "C-Team" },
    { email: "david@a.com", password: "123456", name: "David", teamId: "A-Team" },
    { email: "eve@b.com", password: "123456", name: "Eve", teamId: "B-Team" },
  ];

  const createdUsers = [];
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hashed },
    });
    createdUsers.push(user);
  }

  const alice = createdUsers.find(u => u.email === "alice@a.com")!;
  const bob = createdUsers.find(u => u.email === "bob@b.com")!;
  const charlie = createdUsers.find(u => u.email === "charlie@c.com")!;

  // --- Create Knowledge Cards ---
  const cards = [
    {
      title: "Introduction to TypeScript",
      content: "TypeScript is a superset of JavaScript that adds static typing.",
      access: "PUBLIC" as const,
      teamId: "A-Team",
      createdById: alice.id,
      summary: "Covers the basics of TypeScript syntax and type checking.",
      tags: ["typescript", "javascript", "basics"],
      relatedCardIds: [],
    },
    {
      title: "Securing REST APIs",
      content: "Learn how to implement authentication and authorization in REST APIs.",
      access: "PRIVATE" as const,
      teamId: "B-Team",
      createdById: bob.id,
      summary: "A guide to building secure APIs with JWT and OAuth.",
      tags: ["security", "api", "authentication"],
      relatedCardIds: [],
    },
    {
      title: "Database Indexing Basics",
      content: "Indexing improves query performance by allowing faster lookups.",
      access: "PUBLIC" as const,
      teamId: "C-Team",
      createdById: charlie.id,
      summary: "Understand how and when to use database indexes effectively.",
      tags: ["database", "indexing", "performance"],
      relatedCardIds: [],
    },
  ];

  const createdCards = [];
  for (const c of cards) {
    const card = await prisma.knowledgeCard.create({ data: c });
    createdCards.push(card);
  }

  // --- Create Likes ---
  await prisma.like.createMany({
    data: [
      { cardId: createdCards[0].id, userId: bob.id },
      { cardId: createdCards[0].id, userId: charlie.id },
      { cardId: createdCards[2].id, userId: alice.id },
    ],
  });

  // --- Update like counts manually ---
  await prisma.knowledgeCard.update({
    where: { id: createdCards[0].id },
    data: { likesCount: 2 },
  });
  await prisma.knowledgeCard.update({
    where: { id: createdCards[2].id },
    data: { likesCount: 1 },
  });

  // --- Create Comments ---
  await prisma.comment.createMany({
    data: [
      { text: "Great intro to TS!", cardId: createdCards[0].id, createdById: bob.id },
      { text: "Loved this explanation.", cardId: createdCards[0].id, createdById: charlie.id },
      { text: "Important topic for backend devs.", cardId: createdCards[1].id, createdById: alice.id },
      { text: "Very clear write-up.", cardId: createdCards[2].id, createdById: bob.id },
    ],
  });

  console.log("✅ Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    prisma.$disconnect();
  });

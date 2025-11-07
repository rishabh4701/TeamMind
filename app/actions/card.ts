"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { enrichCardWithAI } from "./ai";

const cardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  access: z.enum(["PUBLIC", "PRIVATE"]),
});

export async function upsertCard(raw: unknown) {
  const session = await auth();

  // 🧠 Ensure session exists
  if (!session || !session.user) {
    console.error("❌ No active session in upsertCard");
    throw new Error("Unauthorized - user session not found");
  }

  const parsed = cardSchema.parse(raw);

  // 🧩 AI enrichment (summary, tags, related)
  let ai = null;
  try {
    ai = await enrichCardWithAI({ title: parsed.title, content: parsed.content });
  } catch (err) {
    console.warn("⚠️ AI enrichment failed:", err);
  }

  // ✅ Correct data with session values
  const data = {
    title: parsed.title,
    content: parsed.content,
    access: parsed.access,
    teamId: session.user.teamId,       // <-- real team ID from logged-in user
    createdById: session.user.id,      // <-- user ID from session
    summary: ai?.summary ?? "AI enrichment unavailable.",
    tags: ai?.tags ?? [],
    relatedCardIds: ai?.relatedCardIds ?? [],
  };

  if (parsed.id) {
    await prisma.knowledgeCard.update({
      where: { id: parsed.id },
      data,
    });
  } else {
    await prisma.knowledgeCard.create({ data });
  }

  revalidatePath("/dashboard");
  revalidatePath("/team");
}

export async function toggleLike(cardId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.like.findUnique({
    where: { cardId_userId: { cardId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.knowledgeCard.update({
        where: { id: cardId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.like.create({ data: { cardId, userId: session.user.id } }),
      prisma.knowledgeCard.update({
        where: { id: cardId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/team");
}

// 💬 Comments
const commentSchema = z.object({ cardId: z.string(), text: z.string().min(1) });

export async function addComment(raw: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { cardId, text } = commentSchema.parse(raw);

  await prisma.comment.create({
    data: { cardId, text, createdById: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/team");
}

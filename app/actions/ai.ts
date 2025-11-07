"use server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function enrichCardWithAI(input: { title: string; content: string }) {
  // Fetch a few recent cards to help with related suggestions
  const recent = await prisma.knowledgeCard.findMany({
    select: { id: true, title: true, content: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const sys = `You enrich knowledge cards.
Return JSON with: summary (2-3 sentences), tags (3-6 short tags), relatedCardIds (up to 3 ids from list).\n` +
    `Available candidates:\n` +
    recent.map(r => `- ${r.id}: ${r.title}`).join("\n");

  const user = `Title: ${input.title}\nContent:\n${input.content}\n` +
    `Pick up to three related by ID from the candidate list above (if none fit, return empty array).`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  try {
    const parsed = JSON.parse(resp.choices[0].message.content || "{}");
    return {
      summary: parsed.summary ?? "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      relatedCardIds: Array.isArray(parsed.relatedCardIds) ? parsed.relatedCardIds : [],
    };
  } catch {
    return { summary: "AI enrichment unavailable.", tags: [], relatedCardIds: [] };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function enrichCardWithAI(input: { title: string; content: string }) {
  console.log("🧠 [AI] Starting enrichment for:", input.title);

  // ✅ Check if API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ [AI] GEMINI_API_KEY is not set in environment variables");
    return {
      summary: "AI enrichment unavailable.",
      tags: [],
      relatedCardIds: [],
    };
  }

  const client = new GoogleGenerativeAI(apiKey);

  const recent = await prisma.knowledgeCard.findMany({
    select: { id: true, title: true, content: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const sysPrompt =
    `You are an AI assistant that enriches knowledge cards.\n` +
    `Return a valid JSON object ONLY with keys: summary, tags, relatedCardIds.\n` +
    `summary: 2-3 sentences summarizing the content.\n` +
    `tags: an array of 3–6 short tags.\n` +
    `relatedCardIds: up to 3 related card IDs from the list.\n\n` +
    `Available existing cards:\n` +
    recent.map((r) => `- ${r.id}: ${r.title}`).join("\n");

  const userPrompt = `${sysPrompt}\n\nTitle: ${input.title}\nContent:\n${input.content}\n`;

  try {
    const model = client.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    console.log("🧠 [AI] Gemini raw response:", text);

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonString = text.slice(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonString);
    console.log("✅ [AI] Parsed enrichment:", parsed);

    return {
      summary: parsed.summary ?? "No summary generated.",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      relatedCardIds: Array.isArray(parsed.relatedCardIds)
        ? parsed.relatedCardIds
        : [],
    };
  } catch (err) {
    console.error("❌ [AI] Gemini enrichment failed:", err);
    // Log more details about the error
    if (err instanceof Error) {
      console.error("❌ [AI] Error message:", err.message);
      console.error("❌ [AI] Error stack:", err.stack);
    }
    return {
      summary: "AI enrichment unavailable.",
      tags: [],
      relatedCardIds: [],
    };
  }
}

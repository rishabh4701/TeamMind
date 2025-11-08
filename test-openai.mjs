import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "AIzaSyARJWwdJIgjmZxI-cSehbk7vvUU51NqA4Q",
});

try {
  const test = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You return JSON with summary and tags." },
      { role: "user", content: "Return JSON with a short summary and 3 tags about React." }
    ],
    response_format: { type: "json_object" },
  });

  console.log("✅ SUCCESS:", test.choices[0].message.content);
} catch (err) {
  console.error("❌ FAILED:", err);
}

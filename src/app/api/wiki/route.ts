import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, papers } = body;

  if (!query || !papers?.length) {
    return NextResponse.json({ error: "Query and papers required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // Build context from top 5 papers
  const context = papers
    .slice(0, 5)
    .map((p: any, i: number) => `Paper ${i + 1}: "${p.title}" (${p.year}) — ${p.abstract}`)
    .join("\n\n");

  const prompt = `You are a research wiki generator for V44V, an academic platform.

Based on these research papers about "${query}", write a concise wiki-style overview.

Papers:
${context}

Write a 3-paragraph overview covering:
1. What "${query}" is — core definition and significance
2. Current state of research — key findings and themes from the papers
3. Why it matters — real-world implications

Rules:
- Plain language, accessible to both researchers and curious non-experts
- No bullet points, flowing prose only
- No citations or reference numbers
- Under 300 words total
- Do not start with "Based on" or "According to"`;

  try {
  const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  }
);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || "Gemini API error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || ""; 

    return NextResponse.json({ wiki: text });
  } catch (error: any) {
    console.error("Wiki error:", error);
    return NextResponse.json({ error: error.message || "Wiki generation failed" }, { status: 500 });
  }
}
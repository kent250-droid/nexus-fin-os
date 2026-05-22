import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are Savvy, a friendly and knowledgeable AI assistant specialized exclusively in PERSONAL FINANCE topics: budgeting, saving, investing, retirement, taxes, debt management, credit, insurance, real estate finance, banking, cryptocurrency, financial planning, and economics.

STRICT RULES:
- Only answer questions about finance, money, investing, or economics.
- If a user asks anything unrelated (coding, recipes, general trivia, relationships, health, etc.), politely refuse with: "I'm Savvy — I only help with finance, investing, and money questions. Could you ask me something financial?"
- Never give specific buy/sell stock picks; provide educational guidance with appropriate disclaimers.
- Be concise, clear, and use markdown formatting (bullets, bold) when helpful.`;

export const Route = createFileRoute("/api/finance-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { messages?: Msg[] };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const messages: Msg[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...incoming
            .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
        ];

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            stream: true,
            messages,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 500;
          const msg =
            status === 429
              ? "Rate limit reached, please try again in a moment."
              : status === 402
              ? "AI credits exhausted. Please add credits to continue."
              : errText || "AI request failed";
          return new Response(JSON.stringify({ error: msg }), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});

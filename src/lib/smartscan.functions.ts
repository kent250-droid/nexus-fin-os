import { createServerFn } from "@tanstack/react-start";

type Task = "summary" | "keywords" | "translate" | "chat" | "insights";

type Input = {
  task: Task;
  text: string;
  targetLanguage?: string;
  question?: string;
};

const SYSTEM: Record<Task, string> = {
  summary:
    "You are SmartScan AI. Summarize the document text in 4-6 concise bullet points. Return plain text, no markdown headings.",
  keywords:
    "Extract 8-12 keywords or key entities from the document text. Return as a comma-separated list, no extra text.",
  translate:
    "You are a professional translator. Translate the user's text into the requested language. Return only the translation.",
  chat:
    "You are SmartScan AI. Answer the user's question about the provided document text in 1-3 sentences. If the text doesn't answer, say so briefly.",
  insights:
    "You are a financial analyst. Provide 3 short, sharp insights or risk observations about the document text. Return as bullets.",
};

export const smartscanAI = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const text = (data.text || "").slice(0, 12000);
    let userContent = text;
    if (data.task === "translate") {
      userContent = `Translate the following into ${data.targetLanguage || "English"}:\n\n${text}`;
    } else if (data.task === "chat") {
      userContent = `Document text:\n${text}\n\nQuestion: ${data.question || ""}`;
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM[data.task] },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Settings.");
      throw new Error(`AI error: ${errText.slice(0, 200)}`);
    }
    const json = await res.json();
    const result: string = json?.choices?.[0]?.message?.content ?? "";
    return { result };
  });
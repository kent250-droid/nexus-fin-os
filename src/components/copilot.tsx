import { useEffect, useRef, useState } from "react";
import { Sparkles, Mic, Send, X, Wand2, AlertTriangle, FileText, Activity } from "lucide-react";

type Msg = { who: "ai" | "me"; text: string };

const SEED: Msg[] = [
  { who: "ai", text: "Good morning. 3 invoices require approval and cash flow dropped 9% this week." },
  { who: "ai", text: "High-risk transaction TXN-9814 ($215,400) is awaiting your review." },
];

const SUGGESTIONS = [
  { icon: FileText, text: "Generate Q3 finance report" },
  { icon: AlertTriangle, text: "Show high-risk transactions" },
  { icon: Activity, text: "Forecast next month cash flow" },
  { icon: Wand2, text: "Draft approval for INV-2041" },
];

export function Copilot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { who: "me", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = mockReply(text);
      setMsgs((m) => [...m, { who: "ai", text: reply }]);
    }, 1100);
  };

  return (
    <>
      {/* Floating orb */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Open Copilot"
      >
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
        <span className="relative size-14 rounded-full gradient-aurora animate-aurora grid place-items-center glow shadow-2xl">
          <Sparkles className="size-6 text-white animate-float" />
        </span>
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success ring-2 ring-background" />
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-[min(92vw,400px)] origin-bottom-right transition-all ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="glass-strong rounded-3xl overflow-hidden ring-glow">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <div className="size-9 rounded-xl gradient-aurora animate-aurora grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">SavvyAi Copilot</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success animate-pulse-ring" /> Online · context-aware
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded-full hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>

          <div className="px-4 py-3 max-h-[50vh] overflow-y-auto scrollbar-thin space-y-2">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.who === "me" ? "justify-end" : ""} animate-fade-up`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                    m.who === "me"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/70 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex">
                <div className="bg-muted/70 rounded-2xl px-3 py-2.5 rounded-bl-md flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-foreground/60 animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-4 pt-1 pb-2 flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => send(s.text)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1"
              >
                <s.icon className="size-3" />
                {s.text}
              </button>
            ))}
          </div>

          <div className="px-3 pb-3 flex items-center gap-2">
            <button className="size-9 grid place-items-center rounded-full bg-muted/70 hover:bg-muted">
              <Mic className="size-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything…"
              className="flex-1 bg-muted/70 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={() => send(input)}
              className="size-9 grid place-items-center rounded-full bg-primary text-primary-foreground glow"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function mockReply(q: string) {
  const s = q.toLowerCase();
  if (s.includes("report")) return "Drafted Q3 report — revenue +18%, expenses +6%. Want me to share it with the executive board?";
  if (s.includes("risk") || s.includes("high")) return "I found 2 high-risk transactions and 1 anomalous supplier pattern. Open the Risk Intelligence module to triage.";
  if (s.includes("forecast") || s.includes("cash")) return "Forecast suggests cash inflow of $412K next month (±6%). Inventory spend may rise 4%.";
  if (s.includes("approval") || s.includes("inv-")) return "Approval drafted for INV-2041. Routing to Sophia Müller (Finance Head).";
  return "Got it. Working on that — I'll surface insights here as soon as they're ready.";
}
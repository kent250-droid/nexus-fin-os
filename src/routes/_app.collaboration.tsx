import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, AtSign } from "lucide-react";
import { PageHeader, Panel } from "@/components/primitives";
import { COLLAB_MESSAGES } from "@/lib/mock";

export const Route = createFileRoute("/_app/collaboration")({ component: Collab });

const PEOPLE = [
  { n: "Amara Osei", r: "CFO", c: "from-blue-500 to-cyan-400", on: true },
  { n: "Daniel Kim", r: "Controller", c: "from-violet-500 to-fuchsia-400", on: true },
  { n: "Sophia Müller", r: "Finance Head", c: "from-emerald-500 to-teal-400", on: true },
  { n: "Jonas Park", r: "Auditor", c: "from-amber-500 to-orange-400", on: false },
  { n: "Priya Nair", r: "Treasurer", c: "from-rose-500 to-pink-400", on: true },
];

function Collab() {
  const [msgs, setMsgs] = useState(COLLAB_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { user: "You", text: input, time: now() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { user: "Daniel", text: "Got it — looking now.", time: now() }]);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Real-Time Collaboration"
        title="Decide together, in flow"
        subtitle="Mention, comment, and approve directly inside any workflow. Like Notion, built for finance."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Online now" subtitle={`${PEOPLE.filter((p) => p.on).length} active`}>
          <ul className="space-y-2">
            {PEOPLE.map((p) => (
              <li key={p.n} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition">
                <div className="relative">
                  <div className={`size-9 rounded-full bg-gradient-to-br ${p.c} grid place-items-center text-white text-xs font-semibold`}>
                    {p.n.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background ${p.on ? "bg-success" : "bg-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium leading-tight">{p.n}</div>
                  <div className="text-[11px] text-muted-foreground">{p.r}</div>
                </div>
                {p.on && <span className="text-[10px] text-success">online</span>}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="INV-2041 · Helix Supplies"
          subtitle="Threaded discussion"
          className="lg:col-span-2"
        >
          <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-2">
            {msgs.map((m, i) => (
              <div key={i} className="flex gap-3 animate-fade-up">
                <div className="size-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white text-[11px] font-semibold">
                  {m.user.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{m.user}</span>
                    <span className="text-[11px] text-muted-foreground">{m.time}</span>
                  </div>
                  <div className="text-sm mt-0.5">{m.text}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3 items-center text-xs text-muted-foreground">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{animationDelay:`${i*120}ms`}}/>)}
                </div>
                Daniel is typing…
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="size-9 grid place-items-center rounded-full bg-muted/70 hover:bg-muted"><AtSign className="size-4" /></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write a comment, @mention a teammate…"
              className="flex-1 bg-muted/70 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button onClick={send} className="size-9 grid place-items-center rounded-full bg-primary text-primary-foreground glow">
              <Send className="size-4" />
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
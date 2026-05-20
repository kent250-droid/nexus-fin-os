import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck, UserCog, Sparkles, FileEdit, LogIn, CheckSquare } from "lucide-react";
import { PageHeader, Panel } from "@/components/primitives";
import { AUDIT } from "@/lib/mock";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  approval: CheckSquare, edit: FileEdit, ai: Sparkles, report: ShieldCheck, auth: LogIn, close: UserCog,
};

export const Route = createFileRoute("/app/audit")({ component: AuditPage });

function AuditPage() {
  const [q, setQ] = useState("");
  const items = AUDIT.filter((a) => (a.who + a.action).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Smart Audit Trail"
        title="Every action, accountable"
        subtitle="Immutable, AI-classified activity log across people, systems, and Copilot decisions."
      />

      <Panel
        title="Activity timeline"
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search actions or people…"
              className="glass rounded-full pl-9 pr-4 py-1.5 text-sm outline-none w-64"
            />
          </div>
        }
      >
        <ol className="relative border-l border-border/60 ml-4 space-y-4">
          {items.map((a, i) => {
            const Icon = ICONS[a.tag] || ShieldCheck;
            return (
              <li key={i} className="ml-4">
                <span className="absolute -left-[9px] mt-1.5 size-4 rounded-full gradient-aurora animate-aurora ring-2 ring-background" />
                <div className="glass rounded-xl p-3 hover:translate-y-[-1px] transition">
                  <div className="flex items-center gap-2">
                    <div className="size-7 grid place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{a.when} · verified <ShieldCheck className="inline size-3 -mt-0.5 text-success" /></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.tag}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}
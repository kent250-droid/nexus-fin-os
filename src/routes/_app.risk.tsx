import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Eye, Ban, Check, Sparkles } from "lucide-react";
import { PageHeader, Panel, RiskBadge } from "@/components/primitives";
import { TRANSACTIONS } from "@/lib/mock";

export const Route = createFileRoute("/_app/risk")({ component: RiskPage });

const REASONS: Record<string, string[]> = {
  "TXN-9814": ["Amount 12× supplier average", "New banking details (24h)", "Approver outside policy window"],
  "TXN-9819": ["Unusual approval chain", "Late-night submission"],
  "TXN-9816": ["Duplicate invoice signature"],
};

function RiskPage() {
  const sorted = [...TRANSACTIONS].sort((a, b) => b.risk - a.risk);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Risk Score System"
        title="Risk intelligence"
        subtitle="Every transaction is scored by SavvyAi for fraud, anomaly, and policy risk in real time."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "High risk", v: sorted.filter((t) => t.risk >= 70).length, c: "destructive" },
          { label: "Medium risk", v: sorted.filter((t) => t.risk >= 35 && t.risk < 70).length, c: "warning" },
          { label: "Cleared", v: sorted.filter((t) => t.risk < 35).length, c: "success" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 size-24 rounded-full bg-${s.c}/20 blur-2xl`} />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-4xl font-semibold">{s.v}</div>
            <div className={`mt-1 text-xs text-${s.c}`}>updated · just now</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((t) => {
          const reasons = REASONS[t.id] || ["Pattern within tolerance", "Approver verified"];
          return (
            <Panel
              key={t.id}
              title={`${t.party}`}
              subtitle={`${t.id} · ${t.type} · $${t.amount.toLocaleString()}`}
              action={<RiskBadge score={t.risk} />}
            >
              <div className="flex items-center gap-4">
                <RiskMeter score={t.risk} />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">AI explanation</div>
                  <ul className="space-y-1 text-sm">
                    {reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 rounded-full glass text-xs flex items-center gap-1.5"><Eye className="size-3.5" /> Investigate</button>
                    {t.risk >= 70 ? (
                      <button className="px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center gap-1.5"><Ban className="size-3.5" /> Block</button>
                    ) : (
                      <button className="px-3 py-1.5 rounded-full bg-success/90 text-white text-xs flex items-center gap-1.5"><Check className="size-3.5" /> Approve</button>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function RiskMeter({ score }: { score: number }) {
  const color = score >= 70 ? "var(--destructive)" : score >= 35 ? "var(--warning)" : "var(--success)";
  const deg = (score / 100) * 360;
  return (
    <div
      className="size-24 rounded-full grid place-items-center relative shrink-0"
      style={{ background: `conic-gradient(${color} ${deg}deg, color-mix(in oklab, var(--muted) 60%, transparent) 0)` }}
    >
      <div className="size-[80%] rounded-full bg-card grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold tabular-nums">{score}</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">risk</div>
        </div>
      </div>
      <ShieldAlert className="size-4 absolute -top-1 -right-1 text-primary" />
    </div>
  );
}
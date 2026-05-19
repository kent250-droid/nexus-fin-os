import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/primitives";
import { ORG_EDGES, ORG_NODES } from "@/lib/mock";

export const Route = createFileRoute("/_app/org-map")({ component: OrgMap });

function OrgMap() {
  const [hover, setHover] = useState<string | null>(null);
  const find = (id: string) => ORG_NODES.find((n) => n.id === id)!;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interactive Organization Map"
        title="How your organization breathes"
        subtitle="Live workflow connections, approval routing, and inter-department activity."
      />

      <Panel title="Org graph" subtitle="Click a node to inspect">
        <div className="relative w-full h-[520px] rounded-2xl grid-bg overflow-hidden">
          {/* glow blobs */}
          <div className="absolute -top-20 -left-20 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-accent/20 blur-3xl" />

          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            {ORG_EDGES.map(([a, b], i) => {
              const A = find(a), B = find(b);
              const active = hover === a || hover === b;
              return (
                <line
                  key={i}
                  x1={`${A.x}%`} y1={`${A.y}%`} x2={`${B.x}%`} y2={`${B.y}%`}
                  stroke="url(#edge)"
                  strokeWidth={active ? 2.5 : 1.2}
                  strokeDasharray="6 6"
                  opacity={active ? 1 : 0.6}
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="3s" repeatCount="indefinite" />
                </line>
              );
            })}
          </svg>

          {ORG_NODES.map((n) => (
            <div
              key={n.id}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className={`relative size-24 rounded-2xl glass grid place-items-center text-center transition-all ${hover === n.id ? "ring-glow scale-110" : ""}`}>
                <div className="absolute inset-0 rounded-2xl animate-pulse-ring" />
                <div>
                  <div className="text-sm font-semibold">{n.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{Math.floor(Math.random() * 40) + 10} active</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Approval chains", "Workflow throughput", "Inter-dept handoffs"].map((t, i) => (
          <Panel key={t} title={t}>
            <div className="text-3xl font-semibold">{[24, 1842, 96][i]}{i === 2 ? "%" : ""}</div>
            <div className="text-xs text-muted-foreground mt-1">Healthy · auto-routed by SavvyAi</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
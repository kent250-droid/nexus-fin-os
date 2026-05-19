import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, Users } from "lucide-react";
import { PageHeader, Panel } from "@/components/primitives";
import { ORGS } from "@/lib/mock";
import { useState } from "react";

export const Route = createFileRoute("/_app/organizations")({ component: Orgs });

function Orgs() {
  const [active, setActive] = useState("nova");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Multi-Organization Support"
        title="Run every entity from one cockpit"
        subtitle="Independent dashboards, branding, roles, and analytics — instantly switchable."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {ORGS.map((o) => (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className={`text-left glass rounded-2xl p-5 hover:translate-y-[-2px] transition-all relative overflow-hidden ${active === o.id ? "ring-glow" : ""}`}
          >
            <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br ${o.color} opacity-30 blur-2xl`} />
            <div className={`size-12 rounded-xl bg-gradient-to-br ${o.color} grid place-items-center text-white font-semibold`}>
              {o.name.split(" ").map((w) => w[0]).join("")}
            </div>
            <div className="mt-3 font-semibold">{o.name}</div>
            <div className="text-xs text-muted-foreground">{o.plan} · {o.users.toLocaleString()} users</div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3" /> {Math.floor(o.users / 6)} active now
              </div>
              {active === o.id && <Check className="size-4 text-primary" />}
            </div>
          </button>
        ))}

        <button className="rounded-2xl border-2 border-dashed border-border/60 grid place-items-center min-h-[180px] text-muted-foreground hover:text-foreground hover:border-primary/60 transition group">
          <div className="text-center">
            <Plus className="size-6 mx-auto group-hover:scale-110 transition" />
            <div className="mt-2 text-sm">Add organization</div>
          </div>
        </button>
      </div>

      <Panel title="Workspace analytics" subtitle="Cross-organization overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Total entities", v: ORGS.length },
            { l: "Combined users", v: ORGS.reduce((s, o) => s + o.users, 0).toLocaleString() },
            { l: "Avg. risk score", v: "23" },
            { l: "Uptime", v: "99.99%" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mt-1 text-2xl font-semibold">{s.v}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
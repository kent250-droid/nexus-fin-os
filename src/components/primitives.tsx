import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export function PageHeader({
  eyebrow, title, subtitle, actions,
}: { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-fade-up">
      <div>
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{eyebrow}</div>}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle && <p className="mt-1.5 text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label, value, delta, icon: Icon, prefix = "", suffix = "",
}: {
  label: string; value: number; delta?: number; icon?: React.ComponentType<{ className?: string }>;
  prefix?: string; suffix?: string;
}) {
  const v = useCountUp(value);
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group hover:translate-y-[-2px] transition-all">
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition" />
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && (
          <div className="size-9 rounded-xl glass grid place-items-center">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {prefix}{v.toLocaleString()}{suffix}
      </div>
      {delta !== undefined && (
        <div className={`mt-1 text-xs flex items-center gap-1 ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
          {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  );
}

export function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) { setV(target); return; }
    startedRef.current = true;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

export function Panel({
  title, subtitle, action, children, className = "",
}: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const level = score >= 70 ? "high" : score >= 35 ? "med" : "low";
  const map = {
    high: { c: "text-destructive bg-destructive/15 ring-destructive/40", label: "High" },
    med: { c: "text-warning bg-warning/15 ring-warning/40", label: "Medium" },
    low: { c: "text-success bg-success/15 ring-success/40", label: "Low" },
  }[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full ring-1 ${map.c}`}>
      <span className="size-1.5 rounded-full bg-current animate-pulse-ring" /> {map.label} · {score}
    </span>
  );
}
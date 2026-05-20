import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShieldAlert, Network, MessagesSquare, ScrollText,
  AudioLines, Building2, RefreshCcw, Sparkles, Search, Bell, Wifi, WifiOff,
  Home,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { ORGS } from "@/lib/mock";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/app", label: "Command Center", icon: LayoutDashboard },
  { to: "/app/risk", label: "Risk Intelligence", icon: ShieldAlert },
  { to: "/app/org-map", label: "Organization Map", icon: Network },
  { to: "/app/collaboration", label: "Collaboration", icon: MessagesSquare },
  { to: "/app/audit", label: "Audit Trail", icon: ScrollText },
  { to: "/app/narration", label: "Voice Briefing", icon: AudioLines },
  { to: "/app/organizations", label: "Organizations", icon: Building2 },
  { to: "/app/sync", label: "Cloud Sync", icon: RefreshCcw },
] as const;

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [online, setOnline] = useState(true);
  const [orgId, setOrgId] = useState("nova");
  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    u();
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => { window.removeEventListener("online", u); window.removeEventListener("offline", u); };
  }, []);
  const org = ORGS.find((o) => o.id === orgId)!;

  return (
    <div className="min-h-screen flex text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-2 p-4 border-r border-border/50 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="relative size-9 rounded-xl gradient-aurora animate-aurora grid place-items-center glow">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-semibold leading-tight">SavvyAi</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Enterprise OS</div>
          </div>
        </div>

        <select
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          className="mt-2 glass rounded-xl px-3 py-2 text-sm outline-none focus:ring-glow"
        >
          {ORGS.map((o) => (
            <option key={o.id} value={o.id}>{o.name} · {o.plan}</option>
          ))}
        </select>

        <nav className="mt-3 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = path === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                <span>{n.label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary animate-pulse-ring" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto glass rounded-2xl p-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${online ? "bg-success animate-pulse-ring" : "bg-destructive"}`} />
            <span className="text-muted-foreground">{online ? "All systems nominal" : "Offline — caching"}</span>
          </div>
          <div className="mt-2 text-muted-foreground/80">v4.2 · {org.name}</div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/50">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <Link to="/" className="hidden lg:flex items-center gap-2" title="Back to home">
              <div className="size-8 rounded-lg gradient-aurora animate-aurora grid place-items-center">
                <Home className="size-4 text-white" />
              </div>
              <span className="font-semibold text-sm">Home</span>
            </Link>
            <Link to="/" className="lg:hidden flex items-center gap-2" title="Back to home">
              <div className="size-8 rounded-lg gradient-aurora animate-aurora grid place-items-center">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="font-semibold">SavvyAi</span>
            </Link>
            <div className="relative hidden md:flex items-center flex-1 max-w-xl">
              <Search className="absolute left-3 size-4 text-muted-foreground" />
              <input
                placeholder="Ask SavvyAi or search invoices, people, reports…"
                className="w-full glass rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50"
              />
              <kbd className="absolute right-3 text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
            <div className="flex-1 md:hidden" />
            <button className="relative size-9 grid place-items-center rounded-full glass">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-pulse-ring" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 glass rounded-full">
              {online ? <Wifi className="size-3.5 text-success" /> : <WifiOff className="size-3.5 text-destructive" />}
              <span className="text-muted-foreground">{online ? "Live" : "Offline"}</span>
            </div>
            <ThemeToggle />
            <div className={`size-9 rounded-full bg-gradient-to-br ${org.color} text-white grid place-items-center text-xs font-semibold ring-2 ring-background`}>
              {org.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCcw, Check, HardDrive } from "lucide-react";
import { PageHeader, Panel } from "@/components/primitives";

export const Route = createFileRoute("/_app/sync")({ component: Sync });

function Sync() {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [history, setHistory] = useState<{ t: string; ok: boolean; what: string }[]>([
    { t: "08:21", ok: true, what: "212 records reconciled" },
    { t: "07:48", ok: true, what: "Auto-sync after network recovery" },
    { t: "Yesterday", ok: true, what: "Encrypted snapshot uploaded" },
  ]);

  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => { window.removeEventListener("online", u); window.removeEventListener("offline", u); };
  }, []);

  const sync = () => {
    setSyncing(true); setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        const n = p + 7 + Math.random() * 6;
        if (n >= 100) {
          clearInterval(id);
          setSyncing(false);
          setHistory((h) => [{ t: now(), ok: true, what: "Manual sync completed" }, ...h]);
          return 100;
        }
        return n;
      });
    }, 180);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Offline + Cloud Sync"
        title="Always-on, even when offline"
        subtitle="Edits are cached locally and reconciled the moment connectivity returns."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          title="Connection"
          subtitle={online ? "Cloud reachable" : "Working offline"}
          className="relative overflow-hidden"
        >
          <div className={`absolute -top-10 -right-10 size-32 rounded-full blur-2xl ${online ? "bg-success/30" : "bg-destructive/30"}`} />
          <div className="flex items-center gap-4">
            <div className={`size-16 rounded-2xl grid place-items-center ${online ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
              {online ? <Cloud className="size-7" /> : <CloudOff className="size-7" />}
            </div>
            <div>
              <div className="text-2xl font-semibold">{online ? "Online" : "Offline"}</div>
              <div className="text-xs text-muted-foreground">{online ? "Realtime sync active" : "Edits cached locally"}</div>
            </div>
          </div>
        </Panel>

        <Panel title="Local cache" subtitle="Encrypted on device">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-primary/15 text-primary grid place-items-center">
              <HardDrive className="size-7" />
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">4,812</div>
              <div className="text-xs text-muted-foreground">records ready to sync</div>
            </div>
          </div>
        </Panel>

        <Panel title="Sync action" subtitle="Manual or auto">
          <button
            onClick={sync}
            disabled={syncing}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground glow flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <RefreshCcw className={`size-4 ${syncing ? "animate-spin-slow" : ""}`} />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground tabular-nums">{Math.floor(progress)}%</div>
        </Panel>
      </div>

      <Panel title="Sync history">
        <ul className="divide-y divide-border/40">
          {history.map((h, i) => (
            <li key={i} className="py-3 flex items-center gap-3">
              <div className={`size-8 rounded-lg grid place-items-center ${h.ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                <Check className="size-4" />
              </div>
              <div className="flex-1 text-sm">{h.what}</div>
              <div className="text-xs text-muted-foreground">{h.t}</div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
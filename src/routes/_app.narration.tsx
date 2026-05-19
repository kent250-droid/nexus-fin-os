import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, AudioLines } from "lucide-react";
import { PageHeader, Panel } from "@/components/primitives";

export const Route = createFileRoute("/_app/narration")({ component: Narration });

const BRIEFINGS = [
  { t: "Executive Daily Briefing", d: "1:42", text: "Monthly revenue increased by 12%. Three high-risk transactions detected. Procurement expenses exceeded the planned budget." },
  { t: "Cash Flow Summary", d: "0:58", text: "Cash inflow trending positive across Q3. Forecast for next month: $412K net positive." },
  { t: "Risk Digest", d: "1:14", text: "Two suppliers showing anomalous behavior. Copilot recommends review by end of day." },
];

function Narration() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => () => speechSynthesis?.cancel(), []);

  const toggle = () => {
    if (typeof speechSynthesis === "undefined") return;
    if (playing) {
      speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(BRIEFINGS[active].text);
    u.rate = 1; u.pitch = 1;
    u.onend = () => setPlaying(false);
    utterRef.current = u;
    speechSynthesis.speak(u);
    setPlaying(true);
  };

  const next = () => {
    speechSynthesis?.cancel();
    setPlaying(false);
    setActive((a) => (a + 1) % BRIEFINGS.length);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Voice Narration"
        title="Your executive briefing, spoken"
        subtitle="SavvyAi reads insights aloud — perfect for commutes, board rooms, and accessibility."
      />

      <Panel title={BRIEFINGS[active].t} subtitle={`Duration ${BRIEFINGS[active].d}`}>
        <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="size-28 rounded-full gradient-aurora animate-aurora grid place-items-center glow">
                <AudioLines className={`size-10 text-white ${playing ? "animate-pulse" : ""}`} />
              </div>
              {playing && <div className="absolute inset-0 rounded-full animate-pulse-ring" />}
            </div>

            <div className="flex-1">
              <Waveform playing={playing} />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{BRIEFINGS[active].text}</p>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={toggle} className="size-12 grid place-items-center rounded-full bg-primary text-primary-foreground glow">
                  {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
                </button>
                <button onClick={next} className="size-10 grid place-items-center rounded-full glass">
                  <SkipForward className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BRIEFINGS.map((b, i) => (
          <button
            key={b.t}
            onClick={() => { speechSynthesis?.cancel(); setPlaying(false); setActive(i); }}
            className={`glass rounded-2xl p-4 text-left hover:translate-y-[-2px] transition-all ${i === active ? "ring-glow" : ""}`}
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Briefing</div>
            <div className="mt-1 font-semibold">{b.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{b.d}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Waveform({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-1 h-12">
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-primary to-accent"
          style={{
            height: `${20 + Math.abs(Math.sin(i * 0.6)) * 70}%`,
            animation: playing ? `wf 0.${(i % 5) + 4}s ease-in-out ${i * 30}ms infinite alternate` : "none",
            opacity: playing ? 1 : 0.4,
          }}
        />
      ))}
      <style>{`@keyframes wf{from{transform:scaleY(.4)}to{transform:scaleY(1)}}`}</style>
    </div>
  );
}
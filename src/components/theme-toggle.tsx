import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(stored);
  }, []);
  useEffect(() => {
    const apply = () => {
      const m = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = theme === "dark" || (theme === "system" && m);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    localStorage.setItem("theme", theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const opts: { v: Theme; icon: React.ReactNode }[] = [
    { v: "light", icon: <Sun className="size-3.5" /> },
    { v: "system", icon: <Monitor className="size-3.5" /> },
    { v: "dark", icon: <Moon className="size-3.5" /> },
  ];
  return (
    <div className="glass rounded-full p-1 flex items-center gap-0.5">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => setTheme(o.v)}
          className={`size-7 grid place-items-center rounded-full transition-all ${
            theme === o.v ? "bg-primary text-primary-foreground glow" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={o.v}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
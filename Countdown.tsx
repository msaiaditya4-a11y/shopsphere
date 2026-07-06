import { useEffect, useState } from "react";

export function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [target]);
  return (
    <div className="flex gap-2">
      {[
        ["Days", t.d],
        ["Hrs", t.h],
        ["Min", t.m],
        ["Sec", t.s],
      ].map(([label, v]) => (
        <div
          key={label as string}
          className="min-w-[64px] rounded-2xl bg-primary px-3 py-2 text-center text-primary-foreground shadow-soft"
        >
          <div className="font-display text-2xl font-black tabular-nums">
            {String(v).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}

// Streak progress toward the next medal (Gym standards §G8). Three approved shapes, one per place:
//   segments  Home card: one segment per day around the next medal (2a)
//   track     Achievements: the ladder as a line with medals as stations (2b)
//   chain     the nudge after a check-in: last 14 days plus the days still to fill (2c)
import type { CSSProperties } from "react";

export interface LadderRung { days: number; name: string; thumb: string; earned: boolean }

export interface StreakProgressProps {
  variant: "segments" | "track" | "chain";
  current: number;
  /** The rung being worked towards. */
  next: LadderRung;
  ladder?: LadderRung[];
  /** Check-in history for "chain", newest last, true = came in. */
  recent?: boolean[];
  /** On navy (Home hero) the track is white on 18 % white. */
  onNavy?: boolean;
}

export function StreakProgress({ variant, current, next, ladder = [], recent = [], onNavy }: StreakProgressProps) {
  const left = Math.max(0, next.days - current);
  const fill = onNavy ? "#5b93f0" : "var(--signal)";
  const track = onNavy ? "rgba(255,255,255,.18)" : "var(--sunken)";
  const label = `${current} of ${next.days} days to ${next.name}`;

  if (variant === "segments") {
    const size = 96, r = 42, n = Math.min(next.days, 120), gap = 360 / n;
    const segs = Array.from({ length: n }, (_, i) => {
      const a0 = (i * gap - 90) * (Math.PI / 180), a1 = ((i + 1) * gap - gap * 0.28 - 90) * (Math.PI / 180);
      const p = (a: number) => `${size / 2 + r * Math.cos(a)},${size / 2 + r * Math.sin(a)}`;
      return <path key={i} d={`M${p(a0)} A${r},${r} 0 0 1 ${p(a1)}`} stroke={i < Math.round((current / next.days) * n) ? fill : track} strokeWidth={6} fill="none" strokeLinecap="round" />;
    });
    return (
      <span role="img" aria-label={label} style={{ position: "relative", width: size, height: size, display: "inline-block", flex: "none" }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">{segs}</svg>
        <img src={next.thumb} alt="" style={{ position: "absolute", left: 22, top: 22, width: 52, height: 52, filter: "grayscale(.85)", opacity: 0.75 }} />
      </span>
    );
  }

  if (variant === "track") {
    const max = ladder.length ? ladder[ladder.length - 1].days : next.days;
    return (
      <div role="img" aria-label={label} style={{ position: "relative", height: 92, margin: "0 28px" }}>
        <span style={{ position: "absolute", left: 0, right: 0, top: 26, height: 6, borderRadius: 999, background: track }} />
        <span style={{ position: "absolute", left: 0, width: `${Math.min(100, (current / max) * 100)}%`, top: 26, height: 6, borderRadius: 999, background: fill }} />
        {ladder.map((r) => (
          <span key={r.days} style={{ position: "absolute", left: `${(r.days / max) * 100}%`, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <img src={r.thumb} alt="" style={{ width: 56, height: 56, filter: r.earned ? "none" : "grayscale(1)", opacity: r.earned ? 1 : 0.5 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: onNavy ? "#fff" : "var(--ink)" }}>{r.days} days</span>
          </span>
        ))}
      </div>
    );
  }

  const days = recent.slice(-14);
  const cell: CSSProperties = { width: 16, height: 16, borderRadius: 5, flex: "none" };
  return (
    <div role="img" aria-label={`${label}. ${left} to go.`} style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
      {days.map((d, i) => <span key={i} style={{ ...cell, background: d ? fill : track }} />)}
      {Array.from({ length: Math.min(left, 7) }, (_, i) => <span key={`n${i}`} style={{ ...cell, boxShadow: `inset 0 0 0 1.5px ${onNavy ? "#fff" : "var(--ink-soft)"}`, borderRadius: 5, backgroundImage: "none" }} />)}
    </div>
  );
}

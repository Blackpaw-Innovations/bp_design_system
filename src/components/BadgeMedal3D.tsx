// Draggable medal (Gym standards §G7). Replaces BadgeMedal's click-only flip on the medal page and
// the "ready" moment. Grids keep flat thumbnails; tapping one opens this.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface BadgeMedal3DProps {
  front: string;
  back: string;
  /** "7 Day Streak". */
  name: string;
  size?: number;
  /** Shown to screen readers when the back faces up: "Engraved Wanjiku Kamau, 25 Sep 2026, No. 000017". */
  backText?: string;
  onFaceChange?: (face: "front" | "back") => void;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function BadgeMedal3D({ front, back, name, size = 220, backText, onFaceChange }: BadgeMedal3DProps) {
  const [ry, setRy] = useState(0);
  const [rx, setRx] = useState(0);
  const [drag, setDrag] = useState(false);
  const st = useRef({ x: 0, y: 0, ry0: 0, moved: 0, vx: 0, t: 0 });
  const face = ((((Math.round(ry / 180) % 2) + 2) % 2) === 0 ? "front" : "back") as "front" | "back";
  const last = useRef(face);
  useEffect(() => { if (!drag && last.current !== face) { last.current = face; onFaceChange?.(face); } }, [face, drag, onFaceChange]);

  const settle = useCallback((angle: number, vx: number) => {
    const momentum = reduced() ? 0 : Math.max(-120, Math.min(120, vx * 120));
    setRy(Math.round((angle + momentum) / 180) * 180);
    setRx(0);
  }, []);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current = { x: e.clientX, y: e.clientY, ry0: ry, moved: 0, vx: 0, t: performance.now() };
    setDrag(true);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const dx = e.clientX - st.current.x, dy = e.clientY - st.current.y;
    const now = performance.now();
    st.current.vx = (dx - st.current.moved) / Math.max(1, now - st.current.t);
    st.current.moved = dx; st.current.t = now;
    setRy(st.current.ry0 + dx);
    setRx(Math.max(-18, Math.min(18, -dy / 4)));
  };
  const up = () => {
    if (!drag) return;
    setDrag(false);
    if (Math.abs(st.current.moved) < 6) settle(ry + 180, 0); // a plain tap flips
    else settle(ry, st.current.vx);
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setRy((r) => Math.round(r / 180) * 180 + (e.key === "ArrowLeft" ? -180 : 180));
    }
  };

  // Faces need no filter or shadow on the rotating element: a filter flattens the 3D context and hides the back.
  return (
    <div role="button" tabIndex={0} aria-label={`${name}. ${face === "back" ? backText ?? "Engraved back" : "Front"}. Drag or press to turn.`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
      style={{ width: size, height: size, perspective: size * 4.5, touchAction: "none", cursor: drag ? "grabbing" : "grab", userSelect: "none", position: "relative" }}>
      <span aria-hidden="true" style={{ position: "absolute", left: "15%", right: "15%", bottom: -size * 0.06, height: size * 0.08, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(10px)" }} />
      <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, transition: drag ? "none" : reduced() ? "none" : "transform .5s cubic-bezier(.2,.8,.2,1)" }}>
        <img src={front} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} />
        <img src={back} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
      </div>
    </div>
  );
}

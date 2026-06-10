import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let pcx = cx, pcy = cy;
    let angle = -90; // starts pointing up
    let raf: number;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      pcx = cx; pcy = cy;
      cx = lerp(cx, mx, 0.14);
      cy = lerp(cy, my, 0.14);

      const vx = cx - pcx;
      const vy = cy - pcy;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 0.05) {
        const target = Math.atan2(vy, vx) * (180 / Math.PI);
        // Shortest-path angle lerp (handles 359→0 wrap)
        let delta = target - angle;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        angle += delta * 0.14;
      }

      if (ref.current) {
        ref.current.style.transform =
          `translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${angle}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <svg
      ref={ref}
      width="28"
      height="28"
      viewBox="-14 -14 28 28"
      fill="none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 999999,
        mixBlendMode: "difference",
      }}
    >
      {/* Triangle pointing right → rotation handles direction */}
      <polygon
        points="13,0 -7,-9 -7,9"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <style>{`
        @media (pointer: coarse) {
          svg { display: none !important; }
        }
      `}</style>
    </svg>
  );
}

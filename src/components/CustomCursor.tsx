import { useEffect, useRef, useState } from "react";

const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export default function CustomCursor() {
  const ref = useRef<SVGSVGElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER_QUERY);
    let lastX = 0;
    let lastY = 0;
    let hasLastPoint = false;
    let angle = 0;

    const syncEnabled = () => setEnabled(media.matches);
    const moveCursor = (x: number, y: number) => {
      if (!ref.current) return;
      ref.current.style.opacity = "1";
      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch") return;

      const x = event.clientX;
      const y = event.clientY;
      if (hasLastPoint) {
        const dx = x - lastX;
        const dy = y - lastY;
        if (Math.hypot(dx, dy) > 0.6) {
          angle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      }

      lastX = x;
      lastY = y;
      hasLastPoint = true;
      moveCursor(x, y);
    };

    const onPointerLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };

    syncEnabled();
    media.addEventListener("change", syncEnabled);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      media.removeEventListener("change", syncEnabled);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <svg
      ref={ref}
      className="custom-cursor"
      width="22"
      height="22"
      viewBox="-22 -12 26 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 0 -18 -8 -13 0 -18 8Z"
        fill="#000"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

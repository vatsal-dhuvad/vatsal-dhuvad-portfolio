import { useEffect, useRef, useState } from "react";

const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const TIP_OFFSET_X = 20.3;
const TIP_OFFSET_Y = 12;

export default function CustomCursor() {
  const ref = useRef<SVGSVGElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER_QUERY);
    let lastX = 0;
    let lastY = 0;
    let angle = 0;
    let hasLastPoint = false;

    const moveCursor = (nextX: number, nextY: number) => {
      const cursor = ref.current;
      if (!cursor) return;
      cursor.style.opacity = "1";
      cursor.style.transform = `translate3d(${nextX - TIP_OFFSET_X}px, ${nextY - TIP_OFFSET_Y}px, 0) rotate(${angle}deg)`;
    };

    const syncEnabled = () => {
      const shouldEnable = media.matches;
      setEnabled(shouldEnable);
      document.documentElement.classList.toggle("custom-cursor-enabled", shouldEnable);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch") return;

      const nextX = event.clientX;
      const nextY = event.clientY;

      if (hasLastPoint) {
        const dx = nextX - lastX;
        const dy = nextY - lastY;
        if (Math.hypot(dx, dy) > 0.2) {
          angle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      }

      lastX = nextX;
      lastY = nextY;
      hasLastPoint = true;
      moveCursor(nextX, nextY);
    };

    const onPointerLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };

    syncEnabled();
    media.addEventListener("change", syncEnabled);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
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
      width="24"
      height="24"
      viewBox="-22 -12 26 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 0 -18 -8 -13 0 -18 8Z"
        fill="#050505"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

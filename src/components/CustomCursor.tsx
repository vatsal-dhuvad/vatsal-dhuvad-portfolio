import { useEffect, useRef, useState } from "react";

const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export default function CustomCursor() {
  const ref = useRef<SVGSVGElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER_QUERY);
    let lastX = 0;
    let lastY = 0;
    let x = 0;
    let y = 0;
    let angle = 0;
    let hasLastPoint = false;
    let frame = 0;

    const render = () => {
      frame = 0;
      if (!ref.current) return;
      ref.current.style.opacity = "1";
      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
    };

    const scheduleRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const syncEnabled = () => {
      const shouldEnable = media.matches;
      setEnabled(shouldEnable);
      document.documentElement.classList.toggle("custom-cursor-enabled", shouldEnable);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch") return;

      x = event.clientX;
      y = event.clientY;

      if (hasLastPoint) {
        const dx = x - lastX;
        const dy = y - lastY;
        if (Math.hypot(dx, dy) > 0.3) {
          angle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      }

      lastX = x;
      lastY = y;
      hasLastPoint = true;
      scheduleRender();
    };

    const onPointerLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };

    syncEnabled();
    media.addEventListener("change", syncEnabled);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
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
      width="20"
      height="20"
      viewBox="-20 -11 24 22"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 0 -16 -7 -11.5 0 -16 7Z"
        fill="#050505"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

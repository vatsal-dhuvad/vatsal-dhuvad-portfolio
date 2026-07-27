import { useLayoutEffect, useRef } from "react";

const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const BASE_CURSOR_ANGLE = -121.8;
const ROTATION_THRESHOLD = 0.12;

export default function DirectionCursor() {
  const cursorRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER_QUERY);
    const root = document.documentElement;
    let lastX = 0;
    let lastY = 0;
    let angle = -BASE_CURSOR_ANGLE;
    let hasPoint = false;
    let removeListeners = () => {};

    const renderAt = (clientX: number, clientY: number) => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      if (hasPoint) {
        const dx = clientX - lastX;
        const dy = clientY - lastY;
        if (Math.hypot(dx, dy) > ROTATION_THRESHOLD) {
          angle = Math.atan2(dy, dx) * (180 / Math.PI) - BASE_CURSOR_ANGLE;
        }
      }

      lastX = clientX;
      lastY = clientY;
      hasPoint = true;
      cursor.style.opacity = "1";
      cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) rotate(${angle}deg)`;
    };

    const onMove = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if ("pointerType" in pointerEvent && pointerEvent.pointerType === "touch") return;

      const mouseEvent = event as MouseEvent;
      if (hasPoint && mouseEvent.clientX === lastX && mouseEvent.clientY === lastY) return;
      renderAt(mouseEvent.clientX, mouseEvent.clientY);
    };

    const hideCursor = () => {
      hasPoint = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    const activate = () => {
      removeListeners();
      root.classList.toggle("direction-cursor-enabled", media.matches);
      hideCursor();

      if (!media.matches) {
        removeListeners = () => {};
        return;
      }
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("blur", hideCursor);
      document.addEventListener("mouseleave", hideCursor);

      removeListeners = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("blur", hideCursor);
        document.removeEventListener("mouseleave", hideCursor);
      };
    };

    activate();
    media.addEventListener("change", activate);

    return () => {
      removeListeners();
      root.classList.remove("direction-cursor-enabled");
      media.removeEventListener("change", activate);
    };
  }, []);

  return (
    <img
      ref={cursorRef}
      className="direction-cursor"
      src="/cursor-arrow.png"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
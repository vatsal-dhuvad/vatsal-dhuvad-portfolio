import { useLayoutEffect, useRef } from "react";

const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const TIP_OFFSET_X = 25;
const TIP_OFFSET_Y = 16;
const MIN_ROTATION_DISTANCE = 0.15;

export default function MotionCursor() {
  const cursorRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER_QUERY);
    const root = document.documentElement;
    let lastX = 0;
    let lastY = 0;
    let angle = 0;
    let hasPoint = false;
    let lastEventTime = 0;
    let removeMovementListeners = () => {};

    const moveCursor = (clientX: number, clientY: number) => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      if (hasPoint) {
        const dx = clientX - lastX;
        const dy = clientY - lastY;
        if (Math.hypot(dx, dy) > MIN_ROTATION_DISTANCE) {
          angle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      }

      lastX = clientX;
      lastY = clientY;
      hasPoint = true;
      cursor.style.visibility = "visible";
      cursor.style.transform = `translate3d(${clientX - TIP_OFFSET_X}px, ${clientY - TIP_OFFSET_Y}px, 0) rotate(${angle}deg)`;
    };

    const onMove = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if ("pointerType" in pointerEvent && pointerEvent.pointerType === "touch") return;

      const mouseEvent = event as MouseEvent;
      const timeStamp = Math.round(event.timeStamp);
      if (timeStamp === lastEventTime && mouseEvent.clientX === lastX && mouseEvent.clientY === lastY) return;

      lastEventTime = timeStamp;
      moveCursor(mouseEvent.clientX, mouseEvent.clientY);
    };

    const hideCursor = () => {
      hasPoint = false;
      if (cursorRef.current) cursorRef.current.style.visibility = "hidden";
    };

    const setActive = () => {
      removeMovementListeners();
      root.classList.toggle("motion-cursor-enabled", media.matches);
      hideCursor();

      if (!media.matches) {
        removeMovementListeners = () => {};
        return;
      }

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerrawupdate", onMove, { passive: true });
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("blur", hideCursor);
      document.addEventListener("mouseleave", hideCursor);

      removeMovementListeners = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerrawupdate", onMove);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("blur", hideCursor);
        document.removeEventListener("mouseleave", hideCursor);
      };
    };

    setActive();
    media.addEventListener("change", setActive);

    return () => {
      removeMovementListeners();
      root.classList.remove("motion-cursor-enabled");
      media.removeEventListener("change", setActive);
    };
  }, []);

  return (
    <svg
      ref={cursorRef}
      className="motion-cursor"
      width="30"
      height="30"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M25 16 7 6 11.4 16 7 26Z"
        fill="#050505"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const SPEED_THRESHOLD = 0.1;
const SCALE_RESET_MS = 150;

const springConfig = {
  damping: 45,
  stiffness: 400,
  mass: 1,
  restDelta: 0.001,
};

export default function SmoothCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorX = useSpring(useMotionValue(0), springConfig);
  const cursorY = useSpring(useMotionValue(0), springConfig);
  const cursorRotate = useSpring(useMotionValue(0), {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  });
  const cursorScale = useSpring(useMotionValue(1), {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  });

  const lastPoint = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());
  const lastAngle = useRef(0);
  const totalRotation = useRef(0);
  const frame = useRef<number | null>(null);
  const scaleTimer = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER_QUERY);
    const root = document.documentElement;
    const previousBodyCursor = document.body.style.cursor;
    let removeMouseListener = () => {};

    const clearScaleTimer = () => {
      if (scaleTimer.current !== null) {
        window.clearTimeout(scaleTimer.current);
        scaleTimer.current = null;
      }
    };

    const updateFromMouse = (event: MouseEvent) => {
      const nextPoint = { x: event.clientX, y: event.clientY };
      const now = Date.now();
      const elapsed = now - lastTime.current;

      if (elapsed > 0) {
        velocity.current = {
          x: (nextPoint.x - lastPoint.current.x) / elapsed,
          y: (nextPoint.y - lastPoint.current.y) / elapsed,
        };
      }

      lastTime.current = now;
      lastPoint.current = nextPoint;
      cursorX.set(nextPoint.x);
      cursorY.set(nextPoint.y);

      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      if (speed <= SPEED_THRESHOLD) return;

      const nextAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
      let angleDelta = nextAngle - lastAngle.current;

      if (angleDelta > 180) angleDelta -= 360;
      if (angleDelta < -180) angleDelta += 360;

      totalRotation.current += angleDelta;
      cursorRotate.set(totalRotation.current);
      lastAngle.current = nextAngle;

      cursorScale.set(0.95);
      clearScaleTimer();
      scaleTimer.current = window.setTimeout(() => {
        cursorScale.set(1);
        scaleTimer.current = null;
      }, SCALE_RESET_MS);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        updateFromMouse(event);
        frame.current = null;
      });
    };

    const enableCursor = () => {
      removeMouseListener();
      setEnabled(true);
      root.classList.add("smooth-cursor-enabled");
      document.body.style.cursor = "none";
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      removeMouseListener = () => window.removeEventListener("mousemove", onMouseMove);
    };

    const disableCursor = () => {
      removeMouseListener();
      removeMouseListener = () => {};
      setEnabled(false);
      root.classList.remove("smooth-cursor-enabled");
      document.body.style.cursor = previousBodyCursor;
    };

    const syncEnabled = () => {
      if (media.matches) enableCursor();
      else disableCursor();
    };

    syncEnabled();
    media.addEventListener("change", syncEnabled);

    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      clearScaleTimer();
      disableCursor();
      media.removeEventListener("change", syncEnabled);
    };
  }, [cursorX, cursorY, cursorRotate, cursorScale]);

  if (!enabled) return null;

  return (
    <motion.div
      className="smooth-cursor"
      style={{
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: cursorRotate,
        scale: cursorScale,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      aria-hidden="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="54" viewBox="0 0 50 54" fill="none">
        <g filter="url(#smooth-cursor-shadow)">
          <path
            d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
            fill="black"
          />
          <path
            d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
            stroke="white"
            strokeWidth="2.25825"
          />
        </g>
        <defs>
          <filter id="smooth-cursor-shadow" x="0.602397" y="0.952444" width="49.0584" height="52.428" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="2.25825" />
            <feGaussianBlur stdDeviation="2.25825" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_91_7928" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_91_7928" result="shape" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastItem { id: number; message: string; type: ToastType; }

let addFn: ((msg: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "info") {
  if (addFn) addFn(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    addFn = (message, type) => {
      const id = Date.now();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
    };
    return () => { addFn = null; };
  }, []);
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast show ${t.type}`} style={{ animation: "slideOut 0.4s ease forwards 2.8s" }}>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideOut {
          to { transform: translateY(150%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { IconAlert, IconCheck, IconClose, IconInfo } from "@/components/icons";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) => setTimeout(() => dismiss(toast.id), 4200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  const value = useMemo(() => ({ push }), [push]);

  const icons = {
    success: <IconCheck size={16} />,
    error: <IconAlert size={16} />,
    info: <IconInfo size={16} />,
  } as const;

  const tones = {
    success: "border-[#c6e3d5] bg-white text-[#14614a]",
    error: "border-[#f0cfc7] bg-white text-[#8f2f18]",
    info: "border-accent-line bg-white text-[#0b5560]",
  } as const;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border px-4 py-3 shadow-lift ${tones[toast.tone]}`}
          >
            <span className="mt-0.5">{icons[toast.tone]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-ink-muted hover:text-ink"
              aria-label="Fermer la notification"
            >
              <IconClose size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

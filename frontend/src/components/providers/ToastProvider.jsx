"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";

const ToastContext = createContext(toast);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    className: "cf-toast-success",
  },
  error: {
    icon: XCircle,
    className: "cf-toast-error",
  },
  warning: {
    icon: AlertTriangle,
    className: "cf-toast-warning",
  },
  info: {
    icon: Info,
    className: "cf-toast-info",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const queuedToast = sessionStorage.getItem("chaosforge:queued-toast");

    if (queuedToast) {
      sessionStorage.removeItem("chaosforge:queued-toast");

      try {
        const parsed = JSON.parse(queuedToast);
        window.setTimeout(() => {
          toast[parsed.type]?.(parsed.title, parsed.description);
        }, 250);
      } catch {}
    }

    const handleToast = (event) => {
      const nextToast = event.detail;

      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((item) => item.id !== nextToast.id),
        );
      }, 3800);
    };

    window.addEventListener("chaosforge:toast", handleToast);
    return () => window.removeEventListener("chaosforge:toast", handleToast);
  }, []);

  const value = useMemo(() => toast, []);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((item) => {
          const tone = toastStyles[item.type] || toastStyles.info;
          const Icon = tone.icon;

          return (
            <div
              key={item.id}
              className={`
                pointer-events-auto
                animate-in slide-in-from-right-4 fade-in
                rounded-2xl border p-4
                shadow-2xl shadow-black/30
                backdrop-blur-xl transition
                ${tone.className}
              `}
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm opacity-85">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(item.id)}
                  className="rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

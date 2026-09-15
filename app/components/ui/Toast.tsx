"use client";

import { useEffect } from "react";
import { MdCheckCircle, MdClose } from "react-icons/md";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[100] flex max-w-sm items-center gap-3 rounded-lg border border-green-200 bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      <MdCheckCircle className="h-5 w-5 shrink-0" />

      <span>{message}</span>

      <button
        type="button"
        onClick={onClose}
        className="ml-2 rounded p-1 transition-colors hover:bg-white/20"
        aria-label="Cerrar notificación"
      >
        <MdClose className="h-4 w-4" />
      </button>
    </div>
  );
}
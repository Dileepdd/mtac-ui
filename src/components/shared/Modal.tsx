import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open:      boolean;
  onClose?:  () => void;
  children:  ReactNode;
  width?:    number;
}

export function Modal({ open, onClose, children, width = 560 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,15,15,0.35)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "8vh",
        animation: "fade-in 0.12s ease-out",
      }}
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: "92vw", maxHeight: "84vh", overflow: "auto",
          background: "var(--bg-2)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          animation: "modal-in 0.16s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { I } from "@/icons";

interface PopoverProps {
  anchor:    RefObject<HTMLElement | null>;
  open:      boolean;
  onClose?:  () => void;
  children:  ReactNode;
  align?:    "start" | "end";
  width?:    number;
  offsetY?:  number;
}

export function Popover({ anchor, open, onClose, children, align = "start", width = 220, offsetY = 4 }: PopoverProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !anchor.current) return;
    const r = anchor.current.getBoundingClientRect();
    const left = align === "end" ? r.right - width : r.left;
    setPos({ top: r.bottom + offsetY, left });

    // Use click (not mousedown) so MenuItem onClick fires before the outside-click handler.
    // Also exclude clicks inside the popover itself so menu items work.
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!anchor.current?.contains(target) && !popoverRef.current?.contains(target)) {
        onClose?.();
      }
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };

    const tid = setTimeout(() => document.addEventListener("click", close), 0);
    document.addEventListener("keydown", esc);

    return () => {
      clearTimeout(tid);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open, anchor, align, width, offsetY, onClose]);

  if (!open || !pos) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: "fixed", top: pos.top, left: pos.left, width,
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", boxShadow: "var(--shadow-md)",
        zIndex: 90, padding: 4,
        animation: "slide-up 0.08s ease-out",
      }}
    >
      {children}
    </div>
  );
}

interface MenuItemProps {
  icon?:      ReactNode;
  children:   ReactNode;
  kbd?:       string;
  onClick?:   () => void;
  danger?:    boolean;
  selected?:  boolean;
}

export function MenuItem({ icon, children, kbd, onClick, danger, selected }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        height: 28, padding: "0 8px", borderRadius: 4,
        fontSize: 12.5, color: danger ? "#dc2626" : "var(--text)",
        textAlign: "left", background: "transparent",
      }}
    >
      <span style={{ width: 16, display: "inline-flex", justifyContent: "center", color: danger ? "#dc2626" : "var(--text-3)" }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{children}</span>
      {selected && <I.check size={13} stroke={2} />}
      {kbd && <span className="kbd">{kbd}</span>}
    </button>
  );
}

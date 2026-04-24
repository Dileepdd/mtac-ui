import { useState, useEffect, useRef } from "react";

interface InlineNewTaskProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function InlineNewTask({ onSubmit, onCancel }: InlineNewTaskProps) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{
      padding: 10,
      background: "var(--bg-2)",
      border: "1px solid var(--accent)",
      borderRadius: 6,
      boxShadow: "var(--shadow-sm)",
    }}>
      <textarea
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (val.trim()) onSubmit(val.trim()); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        placeholder="What needs to be done?"
        style={{
          width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", fontSize: 13, lineHeight: 1.4,
          color: "var(--text)", minHeight: 38, fontFamily: "inherit",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", marginTop: 8, fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
        <span>ENTER to save · ESC to cancel</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { if (val.trim()) onSubmit(val.trim()); }}
          style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)", background: "none", border: "none", cursor: "pointer" }}
        >
          ADD →
        </button>
      </div>
    </div>
  );
}

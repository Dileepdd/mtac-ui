import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import { Overview } from "../components/Overview";
import { FocusMode } from "../components/FocusMode";

const DAYS   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function greeting(name: string) {
  const h = new Date().getHours();
  const salutation = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${salutation}, ${name.split(" ")[0]}`;
}

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

type Tab = "v1" | "v2";

export default function DashboardPage() {
  const user     = useAuthStore((s) => s.user);
  const openTask = useTaskModalStore((s) => s.openTask);

  const [tab, setTab] = useState<Tab>("v1");

  return (
    <div>
      {/* ── Sticky header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 28px",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0,
        background: "var(--bg)", zIndex: 5,
      }}>
        <div>
          <div className="mono" style={{ color: "var(--text-3)" }}>{todayLabel()}</div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.015 }}>
            {greeting(user?.name ?? "there")}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* OVERVIEW / FOCUS toggle */}
        <div style={{
          display: "flex",
          background: "var(--bg-sub)", border: "1px solid var(--border)",
          borderRadius: 6, padding: 2,
        }}>
          {(["v1", "v2"] as Tab[]).map((v) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              style={{
                height: 24, padding: "0 10px", borderRadius: 4,
                fontSize: 11.5, fontWeight: 500,
                fontFamily: "var(--font-mono)",
                background: tab === v ? "var(--bg-2)" : "transparent",
                color: tab === v ? "var(--text)" : "var(--text-3)",
                boxShadow: tab === v ? "var(--shadow-sm)" : "none",
                border: "none", cursor: "pointer",
                transition: "background 0.08s, color 0.08s",
              }}
            >
              {v === "v1" ? "OVERVIEW" : "FOCUS"}
            </button>
          ))}
        </div>

        {/* New task button */}
        <Btn
          variant="secondary"
          size="sm"
          icon={I.plus({ size: 13, stroke: 2 })}
          onClick={() => openTask(null)}
        >
          New
        </Btn>
      </div>

      {/* ── Tab content ── */}
      {tab === "v1"
        ? <Overview />
        : <FocusMode userName={user?.name ?? ""} onOpenTask={openTask} />
      }
    </div>
  );
}

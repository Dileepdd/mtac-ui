// Tweaks panel: accent color, radius, density, font, theme.

const ACCENTS = [
  { key: "#4F46E5", name: "Indigo" },
  { key: "#7C3AED", name: "Violet" },
  { key: "#0EA5E9", name: "Sky" },
  { key: "#059669", name: "Emerald" },
  { key: "#EA580C", name: "Orange" },
  { key: "#111111", name: "Mono" },
];

const applyTweak = (key, value) => {
  const root = document.documentElement;
  if (key === "accent") {
    root.style.setProperty("--accent", value);
    // Generate related accent colors from the hex
    const hex = value.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    root.style.setProperty("--accent-wash", `rgba(${r}, ${g}, ${b}, 0.09)`);
    // Lighter variant
    const lift = (c) => Math.min(255, Math.round(c + (255 - c) * 0.12));
    root.style.setProperty("--accent-2", `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`);
  }
  if (key === "radius") {
    root.style.setProperty("--radius", value + "px");
    root.style.setProperty("--radius-sm", Math.max(2, value - 2) + "px");
    root.style.setProperty("--radius-lg", (value + 4) + "px");
  }
  if (key === "density") root.setAttribute("data-density", value);
  if (key === "font") root.setAttribute("data-font", value);
  if (key === "theme") root.setAttribute("data-theme", value);
};

// Apply defaults on boot
Object.entries(window.MTAC_TWEAKS || {}).forEach(([k, v]) => applyTweak(k, v));

const TweaksPanel = ({ open, onClose }) => {
  const [tw, setTw] = useState(window.MTAC_TWEAKS);
  const set = (k, v) => {
    const next = { ...tw, [k]: v };
    setTw(next);
    applyTweak(k, v);
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
    } catch {}
  };

  if (!open) return null;

  const Row = ({ label, children }) => (
    <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 8, letterSpacing: 0.3 }}>{label}</div>
      {children}
    </div>
  );

  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 110,
      width: 264,
      background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
      animation: "slide-up 0.16s ease-out", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
        <I.sparkle size={13} style={{ color: "var(--accent)", marginRight: 6 }}/>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Tweaks</span>
        <div style={{ flex: 1 }}/>
        <button onClick={onClose} style={{ color: "var(--text-3)", width: 20, height: 20, borderRadius: 4 }}><I.x size={13}/></button>
      </div>

      <Row label="Accent">
        <div style={{ display: "flex", gap: 6 }}>
          {ACCENTS.map(a => (
            <button key={a.key} onClick={() => set("accent", a.key)} title={a.name} style={{
              width: 22, height: 22, borderRadius: 6,
              background: a.key,
              border: tw.accent === a.key ? "2px solid var(--text)" : "1px solid var(--border)",
              boxShadow: tw.accent === a.key ? "0 0 0 2px var(--bg-2)" : "none",
              outline: "none", transition: "all 0.1s",
            }}/>
          ))}
        </div>
      </Row>

      <Row label="Theme">
        <div style={{ display: "flex", gap: 4, background: "var(--bg-sub)", padding: 3, borderRadius: 6, border: "1px solid var(--border)" }}>
          {["light", "dark"].map(t => (
            <button key={t} onClick={() => set("theme", t)} style={{
              flex: 1, height: 26, borderRadius: 4, fontSize: 12, fontWeight: 500,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              background: tw.theme === t ? "var(--bg-2)" : "transparent",
              color: tw.theme === t ? "var(--text)" : "var(--text-3)",
              boxShadow: tw.theme === t ? "var(--shadow-sm)" : "none",
            }}>
              {t === "light" ? <I.sun size={12}/> : <I.moon size={12}/>}
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </Row>

      <Row label="Font pairing">
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { k: "geist", n: "Geist" },
            { k: "plex", n: "Plex + Serif" },
          ].map(f => (
            <button key={f.k} onClick={() => set("font", f.k)} style={{
              flex: 1, height: 30, fontSize: 12, fontWeight: 500,
              background: tw.font === f.k ? "var(--accent-wash)" : "var(--bg-sub)",
              color: tw.font === f.k ? "var(--accent)" : "var(--text-2)",
              border: `1px solid ${tw.font === f.k ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 5,
            }}>{f.n}</button>
          ))}
        </div>
      </Row>

      <Row label="Density">
        <div style={{ display: "flex", gap: 4 }}>
          {["compact", "comfortable", "spacious"].map(d => (
            <button key={d} onClick={() => set("density", d)} style={{
              flex: 1, height: 26, fontSize: 11.5, fontWeight: 500,
              background: tw.density === d ? "var(--accent-wash)" : "var(--bg-sub)",
              color: tw.density === d ? "var(--accent)" : "var(--text-2)",
              border: `1px solid ${tw.density === d ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 5, textTransform: "capitalize",
            }}>{d.slice(0, 4)}</button>
          ))}
        </div>
      </Row>

      <Row label={`Corner radius · ${tw.radius}px`}>
        <input type="range" min={0} max={16} step={2} value={tw.radius}
          onChange={e => set("radius", parseInt(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }}/>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-4)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
          <span>sharp</span><span>rounded</span>
        </div>
      </Row>
    </div>
  );
};

Object.assign(window, { TweaksPanel, applyTweak });

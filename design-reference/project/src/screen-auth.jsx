// Auth screens: Login, Register, Forgot password.
// Split-screen refined minimal layout.

const AuthShell = ({ children, setRoute }) => (
  <div style={{
    minHeight: "100vh", display: "grid",
    gridTemplateColumns: "1fr 1fr", background: "var(--bg)",
  }}>
    {/* Left: form */}
    <div style={{ display: "flex", flexDirection: "column", padding: "32px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--accent)", display: "inline-flex" }}><I.logo size={20}/></span>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.02 }}>MTAC</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 340 }}>{children}</div>
      </div>
      <div className="mono" style={{ color: "var(--text-4)", display: "flex", gap: 14 }}>
        <span>© 2026 MTAC</span>
        <span>·</span>
        <a>Privacy</a>
        <a>Terms</a>
        <a>Docs</a>
      </div>
    </div>
    {/* Right: quiet panel */}
    <div style={{
      borderLeft: "1px solid var(--border)",
      background: "var(--bg-sub)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "32px 48px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
        backgroundSize: "24px 24px",
        maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
        opacity: 0.6,
      }}/>
      <div style={{ position: "relative", zIndex: 1, marginTop: 80 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Built for speed</div>
        <h2 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.02, margin: 0, maxWidth: 420 }}>
          A keyboard-first project tool<br/>
          <span style={{ color: "var(--text-3)" }}>for teams that ship.</span>
        </h2>
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 32, fontSize: 11.5, color: "var(--text-3)" }}>
        <div>
          <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>⌘K</div>
          <div style={{ marginTop: 4 }}>Global command palette</div>
        </div>
        <div>
          <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>~12ms</div>
          <div style={{ marginTop: 4 }}>Average interaction latency</div>
        </div>
        <div>
          <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>42</div>
          <div style={{ marginTop: 4 }}>Keyboard shortcuts</div>
        </div>
      </div>
    </div>
  </div>
);

const Login = ({ setRoute }) => {
  const [show, setShow] = useState(false);
  return (
    <AuthShell setRoute={setRoute}>
      <div style={{ marginBottom: 6, fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>POST /auth/login</div>
      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>Sign in to MTAC</h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        New here? <a onClick={() => setRoute("register")} style={{ color: "var(--accent)", cursor: "pointer" }}>Create an account</a>
      </p>

      <form onSubmit={e => { e.preventDefault(); setRoute("dashboard"); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email">
          <Input icon={<I.mail size={13}/>} type="email" placeholder="you@company.com" defaultValue="elena@mtac.io" autoFocus/>
        </Field>
        <Field label={<div style={{ display: "flex", justifyContent: "space-between" }}><span>Password</span><a onClick={() => setRoute("forgot")} style={{ color: "var(--text-3)", cursor: "pointer", fontWeight: 400 }}>Forgot?</a></div>}>
          <Input icon={<I.lock size={13}/>} type={show ? "text" : "password"} placeholder="••••••••" defaultValue="Password@123"
            rightEl={<button type="button" onClick={() => setShow(!show)} style={{ color: "var(--text-3)" }}>{show ? <I.eyeOff size={13}/> : <I.eye size={13}/>}</button>} />
        </Field>
        <Btn variant="primary" size="lg" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
          Sign in
          <I.arrowRight size={13} stroke={2}/>
        </Btn>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0", color: "var(--text-4)", fontSize: 11 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
        <span className="mono">OR</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
      </div>

      <Btn variant="secondary" size="lg" style={{ width: "100%", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11v3.2h4.5c-.2 1.2-1.5 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.7 3.2 1.2l2.2-2.1C16 5.4 14.2 4.5 12 4.5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5c4.3 0 7.2-3 7.2-7.3 0-.5 0-.9-.1-1.2H12Z"/></svg>
        Continue with Google
      </Btn>
    </AuthShell>
  );
};

const Register = ({ setRoute }) => {
  const [pw, setPw] = useState("");
  const strength = ({ length: pw.length >= 8, up: /[A-Z]/.test(pw), low: /[a-z]/.test(pw), num: /\d/.test(pw), sp: /[^\w\s]/.test(pw) });
  const score = Object.values(strength).filter(Boolean).length;
  return (
    <AuthShell setRoute={setRoute}>
      <div style={{ marginBottom: 6, fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>POST /auth/register</div>
      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>Create your account</h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        Have one? <a onClick={() => setRoute("login")} style={{ color: "var(--accent)", cursor: "pointer" }}>Sign in</a>
      </p>

      <form onSubmit={e => { e.preventDefault(); setRoute("dashboard"); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Full name" hint="Min 3 characters"><Input placeholder="Elena Navarro" autoFocus/></Field>
        <Field label="Work email"><Input icon={<I.mail size={13}/>} type="email" placeholder="you@company.com"/></Field>
        <Field label="Password">
          <Input icon={<I.lock size={13}/>} type="password" placeholder="Min 8 chars" value={pw} onChange={e => setPw(e.target.value)}/>
          <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < score ? (score < 3 ? "#dc2626" : score < 5 ? "#d97706" : "var(--status-done)") : "var(--border)",
                transition: "background 0.1s",
              }}/>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", marginTop: 6, fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
            {[["8+","length"],["A","up"],["a","low"],["9","num"],["#","sp"]].map(([l, k]) => (
              <span key={k} style={{ color: strength[k] ? "var(--status-done)" : "var(--text-4)" }}>
                {strength[k] ? "✓" : "·"} {l}
              </span>
            ))}
          </div>
        </Field>
        <Btn variant="primary" size="lg" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
          Create account
          <I.arrowRight size={13} stroke={2}/>
        </Btn>
      </form>
      <p style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 20, lineHeight: 1.5 }}>
        By creating an account you agree to our <a style={{ color: "var(--text-2)" }}>Terms</a> and <a style={{ color: "var(--text-2)" }}>Privacy Policy</a>.
      </p>
    </AuthShell>
  );
};

const Forgot = ({ setRoute }) => {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell setRoute={setRoute}>
      <button onClick={() => setRoute("login")} style={{ color: "var(--text-3)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        <I.arrowLeft size={13}/> Back to sign in
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>Reset your password</h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        Enter your email and we'll send a reset link.
      </p>
      {!sent ? (
        <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Email"><Input icon={<I.mail size={13}/>} type="email" placeholder="you@company.com" autoFocus/></Field>
          <Btn variant="primary" size="lg" type="submit" style={{ width: "100%", justifyContent: "center" }}>Send reset link</Btn>
        </form>
      ) : (
        <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-sub)", fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--status-done)", marginBottom: 6 }}>
            <I.check size={14} stroke={2}/> <strong style={{ fontWeight: 500, color: "var(--text)" }}>Check your email</strong>
          </div>
          <p style={{ margin: 0, color: "var(--text-3)" }}>If an account matches, a reset link is on its way.</p>
        </div>
      )}
    </AuthShell>
  );
};

Object.assign(window, { Login, Register, Forgot });

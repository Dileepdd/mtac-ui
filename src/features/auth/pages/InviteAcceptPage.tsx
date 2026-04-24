import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { AuthShell } from "../components/AuthShell";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import { useAuthStore } from "@/stores/authStore";
import { loginApi, registerApi, getProfileApi, getInviteInfoApi, acceptInviteApi, type InviteInfo } from "@/api/auth";

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth, clearAuth } = useAuthStore();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    getInviteInfoApi(token)
      .then((info) => {
        setInviteInfo(info);
        setEmail(info.email);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? "This invitation is invalid or has expired.";
        setInviteError(msg);
      });
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setLoading(true);
    try {
      await acceptInviteApi(token);
      toast.success("You've joined the workspace!");
      navigate("/workspaces");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to accept invitation.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await loginApi({ email, password });
      const profile = await getProfileApi(accessToken);
      setAuth(profile, accessToken, refreshToken);
      // user is now authenticated — confirmation screen renders, they click Accept
    } catch (err: any) {
      if (err?.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-email", { state: { email } });
        return;
      }
      const firstDetail = err?.response?.data?.errors?.[0]?.message;
      setFormError(firstDetail ?? err?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      await registerApi({ name, email, password });
      // Must verify email before login — redirect back to this invite after verification
      navigate("/verify-email", { state: { email, returnTo: `/invite/${token}` } });
    } catch (err: any) {
      const firstDetail = err?.response?.data?.errors?.[0]?.message;
      setFormError(firstDetail ?? err?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Invalid / expired invite
  if (inviteError) {
    return (
      <AuthShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.02 }}>Invitation invalid</div>
          <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>{inviteError}</p>
          <Btn variant="secondary" size="sm" onClick={() => navigate("/login")} style={{ width: "fit-content" }}>
            Go to login
          </Btn>
        </div>
      </AuthShell>
    );
  }

  // Authenticated — show explicit confirmation instead of auto-accepting
  if (isAuthenticated && user) {
    const emailMismatch = inviteInfo && inviteInfo.email.toLowerCase() !== user.email.toLowerCase();

    return (
      <AuthShell>
        {/* Invite context banner */}
        {inviteInfo && (
          <div style={{
            background: "var(--bg-sub)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 20,
            fontSize: 13, color: "var(--text-2)", lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--text)" }}>{inviteInfo.inviterName}</strong> invited you to join{" "}
            <strong style={{ color: "var(--text)" }}>{inviteInfo.workspaceName}</strong>
          </div>
        )}

        {/* Email mismatch warning */}
        {emailMismatch && (
          <div style={{
            background: "#fef3c7", border: "1px solid #fbbf24",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            fontSize: 12.5, color: "#92400e", lineHeight: 1.5,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            {I.alertTriangle({ size: 14, style: { flexShrink: 0, marginTop: 1 } })}
            <span>
              This invite was sent to <strong>{inviteInfo?.email}</strong> but you're signed in as{" "}
              <strong>{user.email}</strong>. Sign in as the right account to continue.
            </span>
          </div>
        )}

        {/* Signed-in-as row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", background: "var(--bg-2)",
          border: "1px solid var(--border)", borderRadius: 8, marginBottom: 20,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: `hsl(${user.hue ?? 220} 60% 50%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, color: "#fff", flexShrink: 0,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn
            variant="primary"
            size="lg"
            disabled={loading || !!emailMismatch}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleAccept}
          >
            {loading ? "Joining…" : "Accept invitation"}
            {!loading && I.arrowRight({ size: 13, stroke: 2 })}
          </Btn>
          <Btn
            variant="ghost"
            size="sm"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={clearAuth}
          >
            Sign in as a different account
          </Btn>
        </div>
      </AuthShell>
    );
  }

  // Unauthenticated — sign in or register to accept
  return (
    <AuthShell>
      {inviteInfo && (
        <div style={{
          background: "var(--bg-sub)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 20,
          fontSize: 13, color: "var(--text-2)", lineHeight: 1.5,
        }}>
          <strong style={{ color: "var(--text)" }}>{inviteInfo.inviterName}</strong> invited you to join{" "}
          <strong style={{ color: "var(--text)" }}>{inviteInfo.workspaceName}</strong>
        </div>
      )}

      <div style={{ marginBottom: 20, display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}>
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setFormError(""); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 16px 10px", fontSize: 13, fontWeight: 500,
              color: mode === m ? "var(--text)" : "var(--text-3)",
              borderBottom: mode === m ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Email">
            <Input
              icon={I.mail({ size: 13 })}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: "var(--text-2)", fontWeight: 500 }}>Password</span>
              <Link to="/forgot" style={{ fontSize: 11.5, color: "var(--text-3)", textDecoration: "none" }}>
                Forgot?
              </Link>
            </div>
            <Input
              icon={I.lock({ size: 13 })}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {formError && <div style={{ fontSize: 12, color: "#dc2626" }}>{formError}</div>}
          <Btn variant="primary" size="lg" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Signing in…" : "Sign in & accept"}
            {!loading && I.arrowRight({ size: 13, stroke: 2 })}
          </Btn>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Full name">
            <Input
              icon={I.users({ size: 13 })}
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Email">
            <Input
              icon={I.mail({ size: 13 })}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <Input
              icon={I.lock({ size: 13 })}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {formError && <div style={{ fontSize: 12, color: "#dc2626" }}>{formError}</div>}
          <Btn variant="primary" size="lg" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Creating account…" : "Create account & accept"}
            {!loading && I.arrowRight({ size: 13, stroke: 2 })}
          </Btn>
        </form>
      )}
    </AuthShell>
  );
}

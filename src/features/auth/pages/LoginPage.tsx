import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthShell } from "../components/AuthShell";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import { useAuthStore } from "@/stores/authStore";
import { loginApi, getProfileApi } from "@/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Navigate to="/workspaces" replace />;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await loginApi({ email, password });
      const user = await getProfileApi(accessToken);
      setAuth(user, accessToken, refreshToken);
      navigate("/workspaces");
    } catch (err: any) {
      const firstDetail = err?.response?.data?.errors?.[0]?.message;
      setError(firstDetail ?? err?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 6, fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
        POST /auth/login
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>
        Sign in to MTAC
      </h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        New here?{" "}
        <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email">
          <Input
            icon={I.mail({ size: 13 })}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
            rightEl={
              email && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                  title="Clear"
                >
                  {I.x({ size: 14 })}
                </button>
              )
            }
          />
        </Field>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11.5, color: "var(--text-2)", fontWeight: 500 }}>Password</span>
            <Link to="/forgot" style={{ fontSize: 11.5, color: "var(--text-3)", textDecoration: "none", fontWeight: 400 }}>
              Forgot?
            </Link>
          </div>
          <Input
            icon={I.lock({ size: 13 })}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightEl={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", padding: 0 }}
              >
                {showPw ? I.eyeOff({ size: 13 }) : I.eye({ size: 13 })}
              </button>
            }
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#dc2626" }}>{error}</div>
        )}

        <Btn
          variant="primary"
          size="lg"
          type="submit"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
        >
          {loading ? "Signing in…" : "Sign in"}
          {!loading && I.arrowRight({ size: 13, stroke: 2 })}
        </Btn>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0", color: "var(--text-3)", fontSize: 11 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span className="mono">OR</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/*
        TODO backend: implement Google OAuth (Passport.js or similar).
        Required: GET /auth/google, GET /auth/google/callback endpoints.
        For now, clicking shows a "coming soon" notice.
      */}
      <Btn
        variant="secondary"
        size="lg"
        onClick={() => toast.info("Google sign-in is coming soon.", { description: "Use email & password for now." })}
        style={{ width: "100%", justifyContent: "center" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 11v3.2h4.5c-.2 1.2-1.5 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.7 3.2 1.2l2.2-2.1C16 5.4 14.2 4.5 12 4.5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5c4.3 0 7.2-3 7.2-7.3 0-.5 0-.9-.1-1.2H12Z" />
        </svg>
        Continue with Google
      </Btn>
    </AuthShell>
  );
}

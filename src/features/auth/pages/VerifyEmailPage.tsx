import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import { verifyEmailApi, resendOtpApi } from "@/api/auth";

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email: string    = (location.state as any)?.email    ?? "";
  const returnTo: string = (location.state as any)?.returnTo ?? "/login";

  const [digits, setDigits]       = useState(["", "", "", "", "", ""]);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const otp = digits.join("");

  function handleDigitChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) { setError("Enter the full 6-digit code."); return; }
    if (!email) { setError("Email not found. Go back and try again."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyEmailApi(email, otp);
      navigate(returnTo, { state: returnTo === "/login" ? { verified: true } : undefined });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    try {
      await resendOtpApi(email);
      setCooldown(RESEND_COOLDOWN);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell>
      <button
        onClick={() => navigate("/register")}
        style={{ color: "var(--text-3)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        {I.arrowLeft({ size: 13 })} Back to register
      </button>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: "var(--bg-sub)", border: "1px solid var(--border)", marginBottom: 14 }}>
          {I.mail({ size: 20 })}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 6px" }}>
          Check your email
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: "var(--text-2)" }}>{email || "your email"}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* OTP digit boxes */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 44, height: 52, textAlign: "center",
                fontSize: 22, fontWeight: 600, fontFamily: "var(--font-mono)",
                border: `1.5px solid ${error ? "#dc2626" : d ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 8, background: "var(--bg-2)", color: "var(--text)",
                outline: "none", transition: "border-color 0.1s",
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#dc2626", textAlign: "center", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <Btn
          variant="primary"
          size="lg"
          type="submit"
          disabled={loading || otp.length < 6}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? "Verifying…" : "Verify email"}
          {!loading && I.arrowRight({ size: 13, stroke: 2 })}
        </Btn>
      </form>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-3)" }}>
        Didn't receive it?{" "}
        {cooldown > 0 ? (
          <span className="mono" style={{ color: "var(--text-3)" }}>
            Resend in {cooldown}s
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 13, padding: 0, fontWeight: 500 }}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>
    </AuthShell>
  );
}

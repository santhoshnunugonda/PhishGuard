'use client';

import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

interface AuthSwitchProps {
  defaultMode?: Mode;
}

export default function AuthSwitch({ defaultMode = "login" }: AuthSwitchProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
        window.location.href = "/dashboard";
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        if (data.user) {
          if (!data.session) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
              setError("Account created! Please check your email to confirm, then sign in.");
              setLoading(false);
              return;
            }
          }
          router.refresh();
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .auth-input {
          width: 100%;
          height: 52px;
          padding-left: 46px;
          padding-right: 16px;
          background: #0d1117;
          border: 1.5px solid #21262d;
          border-radius: 12px;
          color: #e6edf3;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .auth-input:focus {
          border-color: #c5f135;
        }
        .auth-input::placeholder {
          color: #484f58;
        }
        .auth-btn-lime {
          width: 100%;
          height: 52px;
          background: #c5f135;
          color: #0d1117;
          font-weight: 700;
          font-size: 16px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
          margin-top: 6px;
        }
        .auth-btn-lime:hover:not(:disabled) {
          background: #d4ff4f;
          transform: translateY(-1px);
        }
        .auth-btn-lime:active:not(:disabled) {
          transform: translateY(0);
        }
        .auth-btn-lime:disabled {
          background: #8fa81d;
          cursor: not-allowed;
        }
        .auth-link {
          color: #c5f135;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          font-size: 14px;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Page */}
      <div style={{
        background: "#0d1117",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>

        {/* Logo */}
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginBottom: "20px", textDecoration: "none",
        }}>
          <Shield style={{ width: 32, height: 32, color: "#c5f135" }} />
          <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.3px" }}>
            Phish<span style={{ color: "#c5f135" }}>Guard</span>
          </span>
        </Link>

        {/* Title area — outside card, like the reference */}
        <h1 style={{
          color: "#e6edf3", fontWeight: 700, fontSize: "30px",
          margin: "0 0 8px", textAlign: "center",
        }}>
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>
        <p style={{ color: "#8b949e", fontSize: "15px", margin: "0 0 28px", textAlign: "center" }}>
          {isSignup ? "Start your phishing awareness training" : "Sign in to continue your training"}
        </p>

        {/* Card */}
        <div style={{
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          padding: "28px 28px 24px",
          boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
        }}>

          {/* Error alert */}
          {error && (
            <div style={{
              background: "rgba(161,29,29,0.3)",
              border: "1.5px solid rgba(239,68,68,0.5)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              fontSize: "14px",
              lineHeight: "1.5",
              marginBottom: "20px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Full Name — signup only */}
            {isSignup && (
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label style={{ color: "#e6edf3", fontWeight: 600, fontSize: "14px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User style={{
                    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                    width: 18, height: 18, color: "#484f58", pointerEvents: "none",
                  }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                    className="auth-input"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <label style={{ color: "#e6edf3", fontWeight: 600, fontSize: "14px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  width: 18, height: 18, color: "#484f58", pointerEvents: "none",
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <label style={{ color: "#e6edf3", fontWeight: 600, fontSize: "14px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  width: 18, height: 18, color: "#484f58", pointerEvents: "none",
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "Min. 6 characters" : "Enter your password"}
                  required
                  minLength={isSignup ? 6 : undefined}
                  disabled={loading}
                  className="auth-input"
                />
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" disabled={loading} className="auth-btn-lime">
              {loading ? (
                <>
                  <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                  {isSignup ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch mode */}
        <p style={{ textAlign: "center", marginTop: "20px", color: "#8b949e", fontSize: "14px" }}>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button onClick={() => switchMode("login")} className="auth-link">
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={() => switchMode("signup")} className="auth-link">
                Sign up
              </button>
            </>
          )}
        </p>

        {/* Back home */}
        <Link href="/" style={{
          color: "#484f58", fontSize: "13px", marginTop: "8px",
          textDecoration: "none", transition: "color 0.2s",
        }}>
          ← Back to home
        </Link>
      </div>
    </>
  );
}

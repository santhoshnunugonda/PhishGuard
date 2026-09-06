'use client';

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

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
    const supabase = createClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
      window.location.href = "/dashboard";
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } },
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      if (data.user) {
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) { setError("Account created! Please check your email to confirm, then sign in."); setLoading(false); return; }
        }
        router.refresh();
        router.push("/dashboard");
      }
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* B&W background image layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/bg-forest.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-4xl min-h-[600px] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(34,197,94,0.15)] flex">

        {/* ── LEFT PANEL (sliding overlay) ── */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-1/2 z-20 flex flex-col items-center justify-center p-10 text-center transition-transform duration-700 ease-in-out",
            "bg-gradient-to-br from-green-900 via-green-800 to-[#052e16]",
            isSignup ? "translate-x-full" : "translate-x-0"
          )}
        >
          {/* Decorative blobs */}
          <div className="absolute top-[-60px] left-[-60px] w-48 h-48 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] right-[-40px] w-40 h-40 bg-green-300/10 rounded-full blur-3xl" />

          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <Shield className="size-8 text-green-300 group-hover:text-white transition-colors" />
            <span className="text-white font-bold text-xl tracking-tight">
              Phish<span className="text-green-300">Guard</span>
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-white mb-3">New here?</h2>
          <p className="text-green-200/70 text-sm leading-relaxed mb-8">
            Join us today and start your phishing awareness journey. Create your account in seconds!
          </p>
          <button
            onClick={() => switchMode("signup")}
            className="border-2 border-white text-white font-bold text-sm px-8 py-2.5 rounded-full hover:bg-white hover:text-green-900 transition-all duration-300 tracking-widest uppercase"
          >
            Sign Up
          </button>
        </div>

        {/* ── RIGHT PANEL (sliding overlay for signup) ── */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-1/2 z-20 flex flex-col items-center justify-center p-10 text-center transition-transform duration-700 ease-in-out",
            "bg-gradient-to-bl from-green-900 via-green-800 to-[#052e16]",
            isSignup ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="absolute top-[-60px] right-[-60px] w-48 h-48 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 bg-green-300/10 rounded-full blur-3xl" />

          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <Shield className="size-8 text-green-300 group-hover:text-white transition-colors" />
            <span className="text-white font-bold text-xl tracking-tight">
              Phish<span className="text-green-300">Guard</span>
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-white mb-3">Already one of us?</h2>
          <p className="text-green-200/70 text-sm leading-relaxed mb-8">
            Welcome back! Sign in to continue your training and protect what matters.
          </p>
          <button
            onClick={() => switchMode("login")}
            className="border-2 border-white text-white font-bold text-sm px-8 py-2.5 rounded-full hover:bg-white hover:text-green-900 transition-all duration-300 tracking-widest uppercase"
          >
            Sign In
          </button>
        </div>

        {/* ── FORM PANELS (left = login, right = signup) ── */}
        <div className="flex w-full">

          {/* Login Form */}
          <div className="w-1/2 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-10">
            <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
            <p className="text-green-600/70 text-xs mb-6">Welcome back to PhishGuard</p>

            <form onSubmit={mode === "login" ? handleSubmit : (e) => e.preventDefault()} className="w-full space-y-4">
              {error && mode === "login" && (
                <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</p>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
                <input
                  type="email"
                  value={mode === "login" ? email : ""}
                  onChange={(e) => mode === "login" && setEmail(e.target.value)}
                  placeholder="Email"
                  required={mode === "login"}
                  disabled={loading || mode !== "login"}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-700 border-2 border-zinc-500 text-white placeholder-zinc-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all text-sm font-medium disabled:opacity-40"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
                <input
                  type="password"
                  value={mode === "login" ? password : ""}
                  onChange={(e) => mode === "login" && setPassword(e.target.value)}
                  placeholder="Password"
                  required={mode === "login"}
                  disabled={loading || mode !== "login"}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-700 border-2 border-zinc-500 text-white placeholder-zinc-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all text-sm font-medium disabled:opacity-40"
                />
              </div>

              <button
                type="submit"
                disabled={loading || mode !== "login"}
                className="w-full h-11 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed tracking-wide uppercase"
              >
                {loading && mode === "login" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Signing In...</>
                ) : (
                  <>Login<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-green-800/60 text-xs">
              <Link href="/" className="hover:text-green-400 transition-colors">← Back to home</Link>
            </p>
          </div>

          {/* Signup Form */}
          <div className="w-1/2 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-10">
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-green-600/70 text-xs mb-6">Join PhishGuard today</p>

            <form onSubmit={mode === "signup" ? handleSubmit : (e) => e.preventDefault()} className="w-full space-y-3">
              {error && mode === "signup" && (
                <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</p>
              )}

              {/* Username */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
                <input
                  type="text"
                  value={mode === "signup" ? name : ""}
                  onChange={(e) => mode === "signup" && setName(e.target.value)}
                  placeholder="Username"
                  required={mode === "signup"}
                  disabled={loading || mode !== "signup"}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-700 border-2 border-zinc-500 text-white placeholder-zinc-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all text-sm font-medium disabled:opacity-40"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
                <input
                  type="email"
                  value={mode === "signup" ? email : ""}
                  onChange={(e) => mode === "signup" && setEmail(e.target.value)}
                  placeholder="Email"
                  required={mode === "signup"}
                  disabled={loading || mode !== "signup"}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-700 border-2 border-zinc-500 text-white placeholder-zinc-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all text-sm font-medium disabled:opacity-40"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
                <input
                  type="password"
                  value={mode === "signup" ? password : ""}
                  onChange={(e) => mode === "signup" && setPassword(e.target.value)}
                  placeholder="Password (min. 6 chars)"
                  required={mode === "signup"}
                  minLength={6}
                  disabled={loading || mode !== "signup"}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-700 border-2 border-zinc-500 text-white placeholder-zinc-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all text-sm font-medium disabled:opacity-40"
                />
              </div>

              <button
                type="submit"
                disabled={loading || mode !== "signup"}
                className="w-full h-11 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed tracking-wide uppercase"
              >
                {loading && mode === "signup" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Creating Account...</>
                ) : (
                  <>Sign Up<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-green-800/60 text-xs">
              <Link href="/" className="hover:text-green-400 transition-colors">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

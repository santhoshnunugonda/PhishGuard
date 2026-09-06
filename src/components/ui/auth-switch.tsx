'use client';

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
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
  };

  return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%2316a34a22%22%20stroke-width%3D%221%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-green-600/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="relative">
              <Shield className="size-10 text-green-400 group-hover:text-green-300 transition-colors" />
              <div className="absolute inset-0 bg-green-400/20 blur-md rounded-full group-hover:bg-green-300/30 transition-all" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              Phish<span className="text-green-400">Guard</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-green-900/40 shadow-[0_0_40px_rgba(34,197,94,0.08)] overflow-hidden">
          {/* Toggle tabs */}
          <div className="flex bg-black/40 border-b border-green-900/30 p-1.5 gap-1.5 mx-4 mt-4 rounded-xl">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300",
                mode === "login"
                  ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                  : "text-green-500/60 hover:text-green-400"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300",
                mode === "signup"
                  ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                  : "text-green-500/60 hover:text-green-400"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-4">
            {/* Heading */}
            <div className="mb-2">
              <h1 className="text-xl font-bold text-white">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-green-500/60 mt-0.5">
                {mode === "login"
                  ? "Sign in to continue your training"
                  : "Start your phishing awareness journey"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Username — signup only */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                mode === "signup" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <label htmlFor="name" className="block text-sm font-medium text-green-300/80 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="johndoe"
                  required={mode === "signup"}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-green-950/20 border border-green-900/40 text-white placeholder-green-700/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-300/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-green-950/20 border border-green-900/40 text-white placeholder-green-700/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-300/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "Min. 6 characters"}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-green-950/20 border border-green-900/40 text-white placeholder-green-700/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] mt-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "login" ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back home */}
        <p className="text-center text-green-700/60 text-sm mt-5">
          <Link href="/" className="hover:text-green-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

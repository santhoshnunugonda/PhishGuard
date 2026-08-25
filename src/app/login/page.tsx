'use client';

import Link from "next/link";
import { Shield, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="size-10 text-[#C0FF00]" />
            <span className="text-white font-bold text-2xl">PhishGuard</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-[#B8BCCF]">Sign in to continue your training</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white placeholder-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white placeholder-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[#B8BCCF] text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#C0FF00] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <p className="text-center text-[#B8BCCF] text-sm mt-6">
          <Link href="/" className="hover:text-[#C0FF00] transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

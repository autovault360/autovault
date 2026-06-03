"use client";

import { useState } from "react";
import { useNProgressRouter } from "@/hooks/use-nprogress-router";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CpaLoginPage() {
  const router = useNProgressRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/cpa/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#010d19] font-sans text-slate-300 antialiased">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <Image
            src="/logo.webp"
            alt="AutoVault360"
            width={200}
            height={40}
            className="mx-auto object-contain"
          />
          <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-emerald-500">
            CPA PORTAL
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0b1322] p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-emerald-400">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Secure CPA Access</span>
          </div>
          <h1 className="text-center text-xl font-semibold text-white">
            CPA Sign In
          </h1>
          <p className="mt-1 text-center text-[12px] text-slate-500">
            Financial review, tax reporting &amp; compliance center
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="cpa-email" className="text-[12px] text-slate-400">
                CPA Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                <Input
                  id="cpa-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cpa@autovault360.com"
                  className="h-11 border-slate-700 bg-[#060d18] pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="cpa-password" className="text-[12px] text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                <Input
                  id="cpa-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-slate-700 bg-[#060d18] pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to CPA Dashboard"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            Dealership admin?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Main portal login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useNProgressRouter } from "@/hooks/use-nprogress-router";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, BadgeCheck, BarChart3, PieChart, Loader2 } from "lucide-react";
import {
  LoginFormCard,
  LoginPageShell,
  type LoginHeroContent,
} from "@/components/auth/login-page-shell";
import { createClient } from "@/lib/supabase/client";

const SALES_REP_ROLES = new Set(["sales_rep"]);

const hero: LoginHeroContent = {
  headline: (
    <>
      Sales Rep.
      <br />
      Your
      <br />
      <span className="text-primary">Command Center.</span>
    </>
  ),
  description:
    "Dedicated sales rep access for tracking deals, managing leads, monitoring performance, and closing more sales across your dealership.",
  features: [
    {
      icon: BadgeCheck,
      title: "Secure & Role-Based",
      description:
        "Enterprise-grade security with role-based access ensures only authorized sales reps can view their data.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Performance Tracking",
      description:
        "Track your sales, commissions, leads, and closing ratios with real-time dashboards built for sales reps.",
    },
    {
      icon: PieChart,
      title: "All-in-One Sales Hub",
      description:
        "Manage leads, customers, deal jackets, commissions, and performance metrics from a single dashboard.",
    },
  ],
};

export default function SalesRepLoginPage() {
  const router = useNProgressRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      await supabase.auth.signOut();
      toast.error("Unable to verify your account. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile || !SALES_REP_ROLES.has(profile.role)) {
      await supabase.auth.signOut();
      toast.error("Access denied. This portal is for sales representatives only.");
      setLoading(false);
      return;
    }

    router.push("/sales-rep/dashboard");
    router.refresh();
  };

  return (
    <LoginPageShell hero={hero}>
      <LoginFormCard
        title="Sales Rep Portal"
        subtitle={
          <>
            Sign in to access your <span className="text-primary font-medium">Sales Rep</span>{" "}
            dashboard.
          </>
        }
      >
        <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="sr-email" className="text-[13px] font-normal text-zinc-400">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-5 w-5 text-primary stroke-[1.5]" />
              <Input
                id="sr-email"
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full border-zinc-900 bg-[#060809]/90 pl-12 pr-4 text-[14px] text-zinc-200 placeholder:text-zinc-700 focus-visible:border-zinc-800 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sr-password" className="text-[13px] font-normal text-zinc-400">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-primary stroke-[1.5]" />
              <Input
                id="sr-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full border-zinc-900 bg-[#060809]/90 pl-12 pr-12 text-[14px] text-zinc-200 placeholder:text-zinc-700 focus-visible:border-zinc-800 focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px] stroke-[1.5]" />
                ) : (
                  <Eye className="h-[18px] w-[18px] stroke-[1.5]" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-[13px] font-normal text-[#35942e] hover:text-primary transition-colors tracking-wide"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-gradient-to-b from-secondary to-primary/90 font-semibold text-[14px] text-white shadow-md shadow-green-950/10 transition-all hover:brightness-105 active:scale-[0.995] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="w-full border-t border-zinc-900/60" />
            <span className="absolute bg-[#0c0e10] px-4 text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
              OR
            </span>
          </div>

          <p className="text-center text-[13px] text-zinc-500 font-normal">
            Dealership admin?{" "}
            <Link href="/login" className="text-[#35942e] hover:underline">
              Main portal login
            </Link>
          </p>
        </form>
      </LoginFormCard>
    </LoginPageShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Mail, BadgeCheck, BarChart3, PieChart, ArrowLeft, Loader2 } from "lucide-react";
import {
  LoginFormCard,
  LoginPageShell,
  type LoginHeroContent,
} from "@/components/auth/login-page-shell";
import { createClient } from "@/lib/supabase/client";

const hero: LoginHeroContent = {
  headline: (
    <>
      Secure.
      <br />
      Manage.
      <br />
      <span className="text-primary">Drive Forward.</span>
    </>
  ),
  description:
    "AutoVault is the all-in-one platform built for modern dealerships. Manage your CRM, inventory, deals, customers, and performance...all from one secure dashboard.",
  features: [
    {
      icon: BadgeCheck,
      title: "Secure by Design & CRM Powered",
      description:
        "Enterprise-grade security protects your data while our CRM tools help you build stronger customer relationships and close more deals.",
    },
    {
      icon: BarChart3,
      title: "Smart Dealership Management",
      description:
        "Manage inventory, customers, leads, communications, appointments, and tasks from one intelligent CRM built for dealerships.",
    },
    {
      icon: PieChart,
      title: "All-in-One Dealership Management",
      description:
        "Everything your dealership needs to run, grow, and succeed...CRM, inventory, deals, analytics, and more, all in one place.",
    },
  ],
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Check your email for the reset link");
    setLoading(false);
  };

  return (
    <LoginPageShell hero={hero}>
      <LoginFormCard
        title="Forgot Password?"
        subtitle={
          <>
            Enter your email and we&apos;ll send you a{" "}
            <span className="text-primary font-medium">reset link</span>.
          </>
        }
      >
        <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-[13px] font-normal text-zinc-400">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-5 w-5 text-primary stroke-[1.5]" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full border-zinc-900 bg-[#060809]/90 pl-12 pr-4 text-[14px] text-zinc-200 placeholder:text-zinc-700 focus-visible:border-zinc-800 focus-visible:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-gradient-to-b from-secondary to-primary/90 font-semibold text-[14px] text-white shadow-md shadow-green-950/10 transition-all hover:brightness-105 active:scale-[0.995] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="flex justify-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[13px] font-normal text-zinc-500 hover:text-primary transition-colors tracking-wide"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </LoginFormCard>
    </LoginPageShell>
  );
}

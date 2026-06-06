"use client";

import { useState } from "react";
import { useNProgressRouter } from "@/hooks/use-nprogress-router";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  BarChart3,
  PieChart,
  Loader2,
} from "lucide-react";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
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

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#020403] font-sans text-zinc-300 antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Main Content Body */}
      <div
        className="relative mx-auto w-full flex items-center gap-6"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        <div
          className="relative h-full hidden w-[60%] lg:flex flex-col p-4 z-10"
          style={{ minHeight: "calc(100vh - 50px)" }}
        >
          {/* Background Asset & Complex Environmental Darkening */}
          <div
            className="absolute inset-0 -z-20 h-full w-full"
            style={{
              clipPath:
                "polygon(0% 0%, 91.6% 0%, 100% 50%, 86.6% 100%, 0% 100%)",
            }}
          >
            <Image
              src="/login_left_bg.jpeg"
              alt="AutoVault Hero Background"
              fill
              sizes="100vw"
              priority
              className="object-cover object-center w-full min-h-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050708]/10 to-[#050708]/80" />
          </div>

          {/* Top Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.webp"
              alt="AutoVault Logo"
              width={220}
              height={45}
              className="p-2 object-cover"
            />
          </div>

          <div className="flex flex-col justify-between gap-12 flex-1">
            {/* Core Branding Headlines */}
            <div className="flex items-center">
              <div className="w-1/2"></div>
              <div className="w-1/2 max-w-xl space-y-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-white xl:text-4xl uppercase leading-[1.1]">
                  Secure.
                  <br />
                  Manage.
                  <br />
                  <span className="text-primary">Drive Forward.</span>
                </h1>
                <p className="text-[13px] leading-relaxed text-zinc-300 max-w-xs pr-10 font-normal">
                  AutoVault is the all-in-one platform built for modern
                  dealerships. Manage your CRM, inventory, deals, customers, and
                  performance...all from one secure dashboard.
                </p>
              </div>
            </div>

            {/* Specs / Features Summary Row */}
            <div className="grid grid-cols-3 gap-2 pr-12 pt-8 ">
              <div className="space-y-3 text-center max-w-xs p-2">
                <div className="text-primary flex items-center justify-center">
                  <BadgeCheck className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm text-center font-bold tracking-wide text-zinc-200">
                  Secure by Design & CRM Powered
                </h4>
                <p className="text-[11px] leading-relaxed text-muted">
                  Enterprise-grade security protects your data while our CRM
                  tools help you build stronger customer relationships and close
                  more deals.
                </p>
              </div>

              <div className="space-y-3 text-center p-2">
                <div className="text-primary flex items-center justify-center">
                  <BarChart3 className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm text-center font-bold tracking-wide text-zinc-200">
                  Smart Dealership Management
                </h4>
                <p className="text-[11px] leading-relaxed text-muted">
                  Manage inventory, customers, leads, communications,
                  appointments, and tasks from one intelligent CRM built for
                  dealerships.
                </p>
              </div>

              <div className="space-y-3 text-center max-w-xs p-2">
                <div className="text-primary flex items-center justify-center">
                  <PieChart className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm text-center font-bold tracking-wide text-zinc-200">
                  All-in-One Dealership Management
                </h4>
                <p className="text-[11px] leading-relaxed text-muted">
                  Everything your dealership needs to run, grow, and
                  succeed...CRM, inventory, deals, analytics, and more, all in one
                  place.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-y-0 left-[50%] hidden lg:block w-[120px] -translate-x-1/2 pointer-events-none z-20 object-cover">
          <svg
            className="h-full w-full"
            viewBox="0 0 120 1000"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="vertical-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="15%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="85%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Crisp straight-line chevron alignment */}
            <path
              d="M 10 0 L 110 500 L 10 1000"
              stroke="url(#vertical-fade)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* RIGHT SIDE: Deep Form Void Box Backdrop */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#020403] relative z-10">
          {/* Subtle Glow Spill Ambient Layer directly behind the card */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#3ea436]/5 rounded-full blur-[100px] pointer-events-none hidden lg:block" />

          {/* Form Card */}
          <div className="w-full max-w-[450px] rounded-xl border border-zinc-900/80 bg-[#0c0e10]/60 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-[4px] sm:p-10 relative">
            {/* Mobile Logo */}
            <div className="flex lg:hidden justify-center mb-8">
              <Image
                src="/logo.webp"
                alt="AutoVault Logo"
                width={150}
                height={40}
                className="object-contain"
              />
            </div>

            {/* Typography Header Group */}
            <div className="space-y-1.5 text-center">
              <h2 className="text-[25px] font-medium tracking-tight text-white font-sans">
                Welcome Back
              </h2>
              <p className="text-[13px] text-zinc-500 font-normal tracking-wide">
                Sign in to access your{" "}
                <span className="text-primary font-medium">AutoVault</span>{" "}
                dashboard.
              </p>
            </div>

            {/* Interactive Area */}
            <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
              {/* Field: Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[13px] font-normal text-zinc-400"
                >
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

              {/* Field: Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[13px] font-normal text-zinc-400"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-primary stroke-[1.5]" />
                  <Input
                    id="password"
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

              {/* Assistance Links */}
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-normal text-[#35942e] hover:text-primary transition-colors tracking-wide"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Component */}
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

              {/* Or Split */}
              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-zinc-900/60" />
                <span className="absolute bg-[#0c0e10] px-4 text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                  OR
                </span>
              </div>

              {/* System Admin Contact */}
              <p className="text-center text-[13px] text-zinc-500 font-normal">
                Don&apos;t have an account?{" "}
                <Link href="#" className="text-[#35942e] hover:underline">
                  Contact your administrator.
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

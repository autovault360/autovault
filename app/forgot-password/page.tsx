"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Mail, BadgeCheck, BarChart3, PieChart, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    <div className="relative flex min-h-screen flex-col justify-between bg-[#020403] font-sans text-zinc-300 antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Main Content Body */}
      <div className="relative mx-auto w-full min-h-screen flex items-center gap-6 ">
        <div className="relative min-h-screen h-full hidden w-[60%] lg:flex flex-col p-5 z-10">
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
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050708]/10 to-[#050708]/80" />
          </div>

          {/* Top Logo */}
          <div className="flex items-center border">
            <Image
              src="/logo.webp"
              alt="AutoVault Logo"
              width={170}
              height={45}
              className="object-contain"
            />
          </div>

          <div className="border flex flex-col justify-between gap-12 flex-1">
            {/* Core Branding Headlines */}
            <div className="flex items-center">
              <div className="w-1/2 border"></div>
              <div className="w-1/2 border max-w-xl space-y-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-white xl:text-4xl uppercase leading-[1.1]">
                  Secure.
                  <br />
                  Manage.
                  <br />
                  <span className="text-primary">Drive Forward.</span>
                </h1>
                <p className="text-[13px] leading-relaxed text-zinc-300 max-w-md font-normal">
                  AutoVault is the all-in-one platform built for modern
                  dealerships. Manage your CRM, inventory, deals, customers, and
                  performance...all from one secure dashboard.
                </p>
              </div>
            </div>

            {/* Specs / Features Summary Row */}
            <div className="grid grid-cols-3 gap-8 pl-12 pt-8">
              <div className="space-y-3 text-center">
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

              <div className="space-y-3 text-center">
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

              <div className="space-y-3 text-center">
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

        <div className="absolute inset-y-0 left-[50%] hidden lg:block w-[120px] -translate-x-1/2 pointer-events-none z-20 overflow-hidden">
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
        <div className="w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#020403] relative z-10">
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
                Forgot Password?
              </h2>
              <p className="text-[13px] text-zinc-500 font-normal tracking-wide">
                Enter your email and we&apos;ll send you a{" "}
                <span className="text-primary font-medium">reset link</span>.
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

              {/* Submit Component */}
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

              {/* Back to Login */}
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
          </div>
        </div>
      </div>

      {/* Footer Meta Layer */}
      <footer className="w-full border-t border-zinc-900/40 bg-[#050708] py-4 px-6 text-center text-[11px] text-zinc-600 md:flex md:justify-between md:px-16 relative z-30">
        <p>&copy; 2024 AutoVault. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-8 md:mt-0">
          <Link href="#" className="hover:text-zinc-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-zinc-400 transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}

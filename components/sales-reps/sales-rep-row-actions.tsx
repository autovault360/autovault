"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { impersonateSalesRep } from "@/lib/sales-reps/server/impersonate-sales-rep";

type Props = {
  salesRepId: string;
  className?: string;
};

export default function SalesRepRowActions({ salesRepId, className }: Props) {
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLoginAs = async () => {
    if (loggingIn) return;
    setLoggingIn(true);

    const result = await impersonateSalesRep(salesRepId);
    if (result.error || !result.email || !result.token) {
      alert(result.error ?? "Failed to generate login link");
      setLoggingIn(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: result.email,
      token: result.token,
      type: "recovery",
    });

    if (error) {
      alert(error.message);
      setLoggingIn(false);
      return;
    }

    router.push("/sales-rep/dashboard");
  };

  return (
    <div className={cn("flex items-center justify-end gap-1.5", className)}>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-blue-500/50 bg-[#0a1220] text-blue-400 transition-colors hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
        aria-label="Edit sales rep"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={loggingIn}
        onClick={handleLoginAs}
        className="grid h-8 w-8 place-items-center rounded-md border border-emerald-600/50 bg-[#0a1220] text-emerald-400 transition-colors hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Login as sales rep"
      >
        <LogIn className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-[#0a1220] text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200"
        aria-label="More actions"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

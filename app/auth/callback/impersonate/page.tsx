"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ImpersonateCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing in...");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session || cancelled) {
        if (!cancelled) setStatus("No session found. Redirecting...");
        await new Promise((r) => setTimeout(r, 1000));
        if (!cancelled) router.replace("/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      if (role === "sales_rep") {
        router.replace("/sales-rep/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }

    handleCallback();

    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-slate-400">{status}</p>
      </div>
    </div>
  );
}

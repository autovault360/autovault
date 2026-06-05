import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, PieChart } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020403] font-sans text-zinc-300 antialiased">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            All-in-One{" "}
            <span className="text-primary">Dealership</span>{" "}
            Operating System
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Manage inventory, sales, expenses, payroll, and taxes ... all in one
            secure platform. Built for modern dealerships.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-gradient-to-b from-secondary to-primary/90 px-8 font-semibold text-white shadow-md shadow-green-950/10 transition-all hover:brightness-105 active:scale-[0.995]"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon={BadgeCheck}
              title="Secure by Design"
              description="Enterprise-grade security with multi-tenant isolation."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-Time Analytics"
              description="Every action updates your financial picture instantly."
            />
            <FeatureCard
              icon={PieChart}
              title="All-in-One Platform"
              description="CRM, inventory, deals, payroll, taxes, and reports."
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-900/60 bg-[#0c0e10]/60 p-6 text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}

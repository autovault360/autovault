import { Playfair_Display } from "next/font/google";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingHeader from "@/components/landing/landing-header";
import LandingHero from "@/components/landing/landing-hero";
import LandingDashboardPreview from "@/components/landing/landing-dashboard-preview";
import LandingTrustBar from "@/components/landing/landing-trust-bar";
import LandingDashboardShowcase from "@/components/landing/landing-dashboard-showcase";
import LandingFooterCta from "@/components/landing/landing-footer-cta";
import LandingFooter from "@/components/landing/landing-footer";
import LandingThemeProvider from "@/components/landing/landing-theme-provider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  const serifClassName = playfair.className;

  return (
    <LandingThemeProvider playfairVariable={playfair.variable}>
      <LandingHeader />
      <LandingHero serifClassName={serifClassName} />
      <LandingDashboardPreview serifClassName={serifClassName} />
      <LandingTrustBar serifClassName={serifClassName} />
      <LandingDashboardShowcase />
      <LandingFooterCta serifClassName={serifClassName} />
      <LandingFooter serifClassName={serifClassName} />
    </LandingThemeProvider>
  );
}

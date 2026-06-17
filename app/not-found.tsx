import { Playfair_Display } from "next/font/google";
import LandingHeader from "@/components/landing/landing-header";
import LandingFooter from "@/components/landing/landing-footer";
import LandingNotFoundContent from "@/components/landing/landing-not-found-content";
import LandingThemeProvider from "@/components/landing/landing-theme-provider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});

export default function NotFound() {
  const serifClassName = playfair.className;

  return (
    <LandingThemeProvider playfairVariable={playfair.variable}>
      <LandingHeader />
      <LandingNotFoundContent serifClassName={serifClassName} />
      <LandingFooter serifClassName={serifClassName} />
    </LandingThemeProvider>
  );
}

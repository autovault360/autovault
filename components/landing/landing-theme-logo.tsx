"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLandingTheme } from "@/components/landing/landing-theme-provider";

type LandingThemeLogoProps = {
  variant?: "header" | "footer";
  className?: string;
};

const sizes = {
  header: { width: 68, height: 68},
  footer: { width: 68, height: 68},
} as const;

export default function LandingThemeLogo({
  variant = "header",
  className,
}: LandingThemeLogoProps) {
  const { isDark } = useLandingTheme();
  const { width, height } = sizes[variant];
  const src = isDark ? "/logos/dark.png" : "/logos/light.png";

  return (
    <Image
      src={src}
      alt="AutoVault360"
      width={width}
      height={height}
      priority={variant === "header"}
      className={cn("object-contain", className)}
    />
  );
}

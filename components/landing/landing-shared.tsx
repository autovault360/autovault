import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { ChartSparkline } from "@/components/landing/landing-charts";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-[10px] border border-[var(--lp-border-card)] bg-[var(--lp-dash-card)] shadow-[0_1px_0_rgba(255,255,255,0.04),0_1px_6px_rgba(0,0,0,0.06)] transition-colors duration-300",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  right,
  compact,
  showcase,
}: {
  title: string;
  right?: ReactNode;
  compact?: boolean;
  showcase?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div
        className={[
          "uppercase tracking-[-0.01em] text-[var(--lp-dash-title)]",
          compact || showcase ? "text-[9px] sm:text-[10px]" : "text-[12px] sm:text-[16px]",
        ].join(" ")}
      >
        {title}
      </div>
      {right}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  delta,
  accent,
  compact,
  showcase,
}: {
  title: string;
  value: string;
  subtitle: string;
  delta: string;
  accent: "green" | "orange";
  compact?: boolean;
  showcase?: boolean;
}) {
  const stroke = accent === "green" ? "#1d7c3a" : "#f97316";
  const isSmall = compact || showcase;
  return (
    <Panel
      className={[
        compact
          ? "min-h-0 px-3 py-3 sm:px-4 sm:py-4"
          : showcase
            ? "min-h-0 px-3 py-3"
            : "min-h-0 sm:min-h-[180px] xl:min-h-[228px] px-4 sm:px-6 py-4 sm:py-5",
      ].join(" ")}
    >
      <div
        className={[
          "uppercase tracking-[-0.01em] text-[var(--lp-dash-title)]",
          compact || showcase ? "text-[9px] sm:text-[10px]" : "text-[12px] sm:text-[16px]",
        ].join(" ")}
      >
        {title}
      </div>
      <div
        className={[
          "font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--lp-dash-value)]",
          compact
            ? "mt-2 text-[20px] sm:text-[28px]"
            : showcase
              ? "mt-1.5 text-[20px] sm:text-[24px] xl:text-[26px]"
              : "mt-3 sm:mt-5 text-[32px] sm:text-[52px]",
        ].join(" ")}
      >
        {value}
      </div>
      <div
        className={[
          "text-[var(--lp-dash-body)]",
          isSmall ? "mt-1 text-[10px] sm:text-[11px]" : "mt-2 sm:mt-3 text-[13px] sm:text-[15px]",
        ].join(" ")}
      >
        {subtitle}
      </div>
      <div
        className={[
          "flex items-center gap-1",
          accent === "green" ? "text-[var(--lp-dash-positive-text)]" : "text-[#ff6c00]",
          isSmall ? "mt-1 text-[10px] sm:text-[11px]" : "mt-2 text-[13px] sm:text-[15px]",
        ].join(" ")}
      >
        {accent === "green" ? (
          <ArrowUpRight className={isSmall ? "h-3 w-3" : "h-4 w-4"} strokeWidth={2.5} />
        ) : null}
        <span>{delta}</span>
      </div>
      {showcase ? (
        <div className="mt-1.5 h-[38px] w-full">
          <ChartSparkline stroke={stroke} variant={accent} height={38} />
        </div>
      ) : !compact ? (
        <div className="hidden xl:block">
          <ChartSparkline stroke={stroke} variant={accent} />
        </div>
      ) : (
        <div className="mt-1 hidden h-[36px] sm:block">
          <ChartSparkline stroke={stroke} variant={accent} height={36} />
        </div>
      )}
    </Panel>
  );
}

export function InventoryLegend({
  color,
  label,
  value,
  compact,
}: {
  color: string;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 text-[var(--lp-fg)]",
        compact ? "text-[11px] sm:text-[12px]" : "text-[14px] sm:text-[15px]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <span
          className={compact ? "h-2.5 w-2.5 rounded-full" : "h-4 w-4 rounded-full"}
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
      </div>
      <span>{value}</span>
    </div>
  );
}

export function IconButton({
  children,
  compact,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      className={[
        "flex items-center justify-center rounded-[2px] border border-[var(--lp-border-strong)] bg-[var(--lp-dash-card)] text-[var(--lp-fg)]",
        compact ? "h-[26px] w-[26px]" : "h-[34px] w-[34px]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SummaryStat({
  tone,
  label,
  value,
  count,
  showcase,
}: {
  tone: "green" | "orange" | "blue";
  label: string;
  value: string;
  count: string;
  showcase?: boolean;
}) {
  const color =
    tone === "green" ? "#12713b" : tone === "orange" ? "#ff6c00" : "#245eea";
  return (
    <div className="border-l border-[var(--lp-border-strong)] pl-2 sm:pl-4 first:border-l-0 first:pl-0">
      <div
        className={[
          "text-center",
          showcase ? "text-[10px] sm:text-[11px]" : "text-[13px] sm:text-[16px]",
        ].join(" ")}
        style={{ color }}
      >
        {label}
      </div>
      <div
        className={[
          "text-center font-semibold leading-none tracking-[-0.05em] text-[var(--lp-dash-value)]",
          showcase
            ? "mt-2 text-[16px] sm:text-[20px]"
            : "mt-3 sm:mt-5 text-[20px] sm:text-[30px]",
        ].join(" ")}
      >
        {value}
      </div>
      <div
        className={[
          "text-center text-[var(--lp-fg-link)]",
          showcase ? "mt-1.5 text-[10px] sm:text-[11px]" : "mt-2 sm:mt-4 text-[13px] sm:text-[16px]",
        ].join(" ")}
      >
        {count}
      </div>
    </div>
  );
}

export function typeToneClass(tone: "green" | "blue") {
  return tone === "green"
    ? "flex items-center text-[var(--lp-dash-positive-text)]"
    : "flex items-center text-[#245eea]";
}

export function statusToneClass(tone: "paid" | "partial" | "pending") {
  return tone === "paid"
    ? "rounded-[4px] bg-[#e6f1e7] px-2 sm:px-4 py-1 sm:py-2 text-center text-[#0c6f2f] text-[12px] sm:text-[14px]"
    : tone === "partial"
      ? "rounded-[4px] bg-[#ffefe0] px-2 sm:px-4 py-1 sm:py-2 text-center text-[#ff6c00] text-[12px] sm:text-[14px]"
      : "rounded-[4px] bg-[#e6effe] px-2 sm:px-4 py-1 sm:py-2 text-center text-[#245eea] text-[12px] sm:text-[14px]";
}

export function inventoryTone(tone: "green" | "blue" | "orange") {
  return tone === "green"
    ? "text-[var(--lp-dash-positive-text)]"
    : tone === "blue"
      ? "text-[#245eea]"
      : "text-[#ff6c00]";
}

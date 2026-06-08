import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const cardSurfaceClass =
  "gap-0 rounded-sm border border-slate-700 bg-transparent py-0 text-slate-200 shadow-none ring-0";

export function DetailCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(cardSurfaceClass, "flex h-full flex-col", className)}>
      {children}
    </Card>
  );
}

export function DetailCardHead({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <CardHeader className="grid-rows-1 items-center gap-0 border-b border-slate-800/60 px-4 py-3 [.border-b]:pb-3">
      <CardTitle className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </CardTitle>
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
  );
}

export function DetailCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContent className={cn("flex flex-1 flex-col px-4 py-3", className)}>
      {children}
    </CardContent>
  );
}

export function DetailLinkAction({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
    >
      {label}
    </Link>
  );
}

export function DetailOutlineButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-4 h-auto w-full gap-1.5 border-slate-700 bg-transparent py-2.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800/40"
      asChild
    >
      <Link href={href}>
        {label}
        <ExternalLink className="h-3 w-3 text-slate-500" />
      </Link>
    </Button>
  );
}

export function DetailRow({
  label,
  value,
  highlight,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-slate-800/50 py-2 last:border-0",
        highlight &&
          "my-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2.5",
      )}
    >
      <span className="shrink-0 text-[11px] text-slate-500">{label}</span>
      <span
        className={cn(
          "text-right text-[11px] font-semibold",
          highlight ? "text-[var(--accent-green)]" : "text-white",
          valueClassName,
        )}
      >
        {value ?? "..."}
      </span>
    </div>
  );
}

export function YesBadge() {
  return (
    <Badge
      variant="outline"
      className="border-emerald-500/35 bg-emerald-500/15 px-2 py-0 text-[10px] font-semibold text-[var(--accent-green)]"
    >
      Yes
    </Badge>
  );
}

/** Wrapper for secondary tab panels (table, timeline, grid). */
export function DetailTabPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        cardSurfaceClass,
        "rounded-sm border border-slate-700 bg-[var(--bg-primary)]/40 p-0",
        className,
      )}
    >
      <CardContent className="p-3.5">{children}</CardContent>
    </Card>
  );
}

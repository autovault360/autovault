import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DetailCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 text-slate-200 shadow-none",
        className,
      )}
    >
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
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {title}
      </div>
      {action}
    </div>
  );
}

export function DetailCardFooter({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="mt-auto -mx-3.5 -mb-3.5 rounded-b-sm border-t border-slate-700 bg-transparent py-2.5 text-center text-[11.5px] font-medium text-blue-400"
    >
      {label} →
    </button>
  );
}

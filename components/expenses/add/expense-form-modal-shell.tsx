"use client";

import { DollarSign, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ExpenseFormModalShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

export default function ExpenseFormModalShell({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: ExpenseFormModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[90vh] w-[calc(100%-2rem)] max-w-[560px] overflow-hidden rounded-2xl border border-slate-800 bg-card p-0 shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
          className,
        )}
      >
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 px-[22px] py-[18px]">
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-white">
              <DollarSign className="h-[18px] w-[18px] text-blue-400" />
              {title}
            </h3>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-[18px] text-slate-500 transition hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-5">{children}</div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-800 px-[22px] py-4">
            {footer}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ExpenseFormGroup({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5", className)}>
      <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.03em] text-slate-500">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

export function ExpenseFormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}

export function ExpenseFileDrop({
  label,
  hasFile,
  onClick,
}: {
  label: string;
  hasFile: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[9px] border border-dashed px-3.5 py-4 text-center text-[12px] transition",
        hasFile
          ? "border-emerald-500/60 font-semibold text-emerald-400"
          : "border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400",
      )}
    >
      {label}
    </button>
  );
}

export function ExpenseGhostButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[9px] border border-slate-700 px-4 py-2.5 text-[13px] font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ExpensePrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[9px] bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-2.5 text-[13px] font-bold text-white transition hover:brightness-110 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

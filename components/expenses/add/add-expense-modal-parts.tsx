"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/shared/modal-primitives";

export function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function DateField({
  value,
  onChange,
  dateInputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => dateInputRef.current?.showPicker?.()}
        className="flex h-8 w-full items-center justify-between rounded-[4px] border border-slate-600 bg-slate-800/50 px-3 text-left text-[13px] text-slate-100"
      >
        {formatDateLabel(value)}
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}

export function FormFieldBlock({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel label={label} required={required} />
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function SideCard({
  title,
  subtitle,
  children,
  className,
  contentClassName,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[6px] border border-slate-700/70 bg-[#0b121c]/80 p-3.5",
        className,
      )}
    >
      <h3 className="text-[12.5px] font-semibold text-white">{title}</h3>
      {subtitle && (
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
          {subtitle}
        </p>
      )}
      <div className={cn(subtitle ? "mt-2.5" : "mt-2", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

export function OptionCheckbox({
  checked,
  onChange,
  label,
  helper,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helper: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 border-b border-slate-800/80 py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-600 bg-slate-800/50 accent-blue-500"
      />
      <span className="min-w-0">
        <span className="block text-[12px] leading-snug text-slate-200">
          {label}
        </span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-500">
          {helper}
        </span>
      </span>
    </label>
  );
}

export function ReceiptUploadSection({
  receiptFile,
  receiptPreview,
  fileInputRef,
  onFileChange,
  title = "Receipt",
}: {
  receiptFile: File | null;
  receiptPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
  title?: string;
}) {
  return (
    <SideCard
      title={title}
      subtitle="Upload a receipt or invoice for this expense."
      className="flex flex-col"
      contentClassName="flex-1 min-h-0"
    >
      {receiptPreview ? (
        <div className="group relative h-full min-h-[220px] overflow-hidden rounded-md border border-slate-600/90 bg-[#0d1420]">
          <img
            src={receiptPreview}
            alt="Receipt preview"
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              className="h-8 rounded-[4px] bg-blue-600 px-4 text-[11.5px] font-medium hover:bg-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="ml-2 h-8 rounded-[4px] px-4 text-[11.5px] font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && fileInputRef.current?.click()
          }
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[220px] flex-1 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-600/90 bg-[#0d1420] px-4 py-6 text-center transition hover:border-slate-500"
        >
          <p className="text-[12px] font-medium text-slate-200">
            Drag & drop your file here
          </p>
          <p className="mt-1 text-[11px] text-slate-500">or</p>
          <Button
            type="button"
            className="mt-2.5 h-8 rounded-[4px] bg-blue-600 px-4 text-[11.5px] font-medium hover:bg-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Choose File
          </Button>
          <p className="mt-2.5 text-[10px] text-slate-500">
            JPG, PNG, PDF up to 10MB
          </p>
          {receiptFile && (
            <p className="mt-2 max-w-full truncate text-[13px] text-blue-400">
              {receiptFile.name}
            </p>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </SideCard>
  );
}

export function ModalFooterActions({
  onCancel,
  onSaveAndAddAnother,
  onSave,
  saving,
}: {
  onCancel: () => void;
  onSaveAndAddAnother: () => void;
  onSave: () => void;
  saving?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-700/80 bg-[#0f1621] px-6 py-3.5 sm:flex-row sm:items-center sm:justify-end">
      <Button
        type="button"
        theme="dark"
        variant="outline"
        className="h-8 rounded-[4px] border-slate-600 bg-transparent px-4 text-[12px] text-slate-300 hover:bg-slate-800/50"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="h-8 rounded-[4px] bg-blue-600 px-4 text-[12px] font-medium hover:bg-blue-500"
        onClick={onSaveAndAddAnother}
        disabled={saving}
      >
        Save & Add Another
      </Button>
      <Button
        type="button"
        className="h-8 rounded-[4px] bg-emerald-600 px-4 text-[12px] font-medium hover:bg-emerald-500"
        onClick={onSave}
        disabled={saving}
      >
        Save Expense
      </Button>
    </div>
  );
}

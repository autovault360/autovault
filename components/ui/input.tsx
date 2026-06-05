"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type InputMode = "text" | "currency" | "date" | "readonly" | "percent";
export type InputTone = "default" | "readonly" | "negative" | "positive";

const baseClass =
  "h-8 w-full min-w-0 rounded-[4px] border px-3 text-[13px] outline-none transition-colors placeholder:text-gray-400 focus-visible:border-[#2563eb] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-100 aria-invalid:border-red-400";

const toneShellClass: Record<InputTone, string> = {
  default: "border-[#E0E0E0] bg-white text-gray-900",
  readonly: "border-[#E0E0E0] bg-[#F5F5F5] text-gray-700",
  negative: "border-red-200 bg-red-100/80 text-red-600",
  positive: "border-emerald-200 bg-emerald-100/80 text-emerald-600",
};

const darkShellClass: Record<InputTone, string> = {
  default: "border-slate-600 bg-slate-800/50 text-slate-100",
  readonly: "border-slate-600 bg-slate-800/50 text-slate-300",
  negative: "border-red-400 bg-red-900/30 text-red-400",
  positive: "border-emerald-400 bg-emerald-900/30 text-emerald-400",
};

/* ......... Currency internals ......... */

function formatCurrencyInput(value: number): string {
  if (Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function CurrencyInput({
  value,
  onValueChange,
  disabled,
  tone = "default",
  theme = "light",
  id,
  "aria-invalid": ariaInvalid,
}: {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  tone?: InputTone;
  theme?: "light" | "dark";
  id?: string;
  "aria-invalid"?: boolean;
}) {
  const [display, setDisplay] = React.useState(() => formatCurrencyInput(value));
  const isEditing = React.useRef(false);

  React.useEffect(() => {
    if (!isEditing.current) {
      setDisplay(formatCurrencyInput(Math.abs(value)));
    }
  }, [value]);

  const resolvedTone = disabled ? "readonly" : tone;
  const shell = theme === "dark" ? darkShellClass[resolvedTone] : toneShellClass[resolvedTone];

  const prefixBg = theme === "dark"
    ? "border-slate-600 bg-slate-800/50 text-slate-400"
    : "border-[#E0E0E0] bg-[#FAFAFA] text-gray-500";

  return (
    <div
      className={cn(
        "flex h-8 overflow-hidden rounded-[4px] border transition-colors",
        shell,
        !disabled && "focus-within:border-[#2563eb]",
        ariaInvalid && "border-red-400",
      )}
    >
      <span className={cn("flex shrink-0 items-center border-r px-2.5 text-[13px]", prefixBg)}>
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        readOnly={disabled}
        aria-invalid={ariaInvalid}
        className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13px] outline-none disabled:cursor-not-allowed"
        value={display}
        onChange={(e) => {
          if (disabled) return;
          isEditing.current = true;
          const raw = e.target.value.replace(/^-\s*/, "");
          setDisplay(raw);
          onValueChange(parseCurrencyInput(raw));
        }}
        onFocus={() => {
          const formatted = formatCurrencyInput(Math.abs(value));
          setDisplay(formatted === "0.00" ? "" : formatted.replace(/\.00$/, ""));
        }}
        onBlur={() => {
          isEditing.current = false;
          setDisplay(formatCurrencyInput(Math.abs(value)));
        }}
      />
    </div>
  );
}

/* ......... Main Input ......... */

function Input({
  className,
  type,
  mode = "text",
  tone,
  theme = "light",
  onValueChange,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  ...props
}: React.ComponentProps<"input"> & {
  mode?: InputMode;
  tone?: InputTone;
  theme?: "light" | "dark";
  onValueChange?: (value: number) => void;
}) {
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  if (mode === "currency") {
    return (
      <CurrencyInput
        value={Number(props.value ?? 0)}
        onValueChange={onValueChange ?? (() => {})}
        disabled={disabled}
        tone={tone}
        theme={theme}
        id={id}
        aria-invalid={ariaInvalid as boolean | undefined}
      />
    );
  }

  if (mode === "date") {
    const dateTone: InputTone = disabled ? "readonly" : tone ?? "default";
    const shell = theme === "dark" ? darkShellClass[dateTone] : toneShellClass[dateTone];
    const dateValue = typeof props.value === "string" ? props.value : "";

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker?.()}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-[4px] border px-3 text-left text-[13px]",
            shell,
            disabled && "cursor-not-allowed",
            className,
          )}
        >
          {formatDateLabel(dateValue)}
          <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={dateValue}
          onChange={(e) => props.onChange?.(e as React.ChangeEvent<HTMLInputElement>)}
          className="pointer-events-none absolute inset-0 opacity-0"
          tabIndex={-1}
          aria-hidden
        />
      </div>
    );
  }

  const resolvedTone: InputTone = disabled
    ? "readonly"
    : mode === "readonly"
      ? "readonly"
      : tone ?? "default";
  const shell = theme === "dark" ? darkShellClass[resolvedTone] : toneShellClass[resolvedTone];

  return (
    <input
      id={id}
      type={type}
      data-slot="input"
      disabled={disabled || mode === "readonly"}
      readOnly={mode === "readonly"}
      aria-invalid={ariaInvalid}
      className={cn(
        baseClass,
        shell,
        className,
      )}
      {...props}
    />
  );
}

Input.displayName = "Input";

export { Input };

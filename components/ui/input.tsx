"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(value: string, placeholder = "Select date"): string {
  if (!value) return placeholder;
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

/** Keep only digits and a single decimal, max 2 fractional digits while typing. */
function sanitizeCurrencyDisplayInput(value: string): string {
  const normalized = value.replace(/,/g, "");
  let result = "";
  let hasDecimal = false;
  let decimalDigits = 0;

  for (const char of normalized) {
    if (char >= "0" && char <= "9") {
      if (hasDecimal) {
        if (decimalDigits >= 2) continue;
        decimalDigits += 1;
      }
      result += char;
      continue;
    }
    if (char === "." && !hasDecimal) {
      hasDecimal = true;
      result += char;
    }
  }

  return result;
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
        autoComplete="off"
        disabled={disabled}
        readOnly={disabled}
        aria-invalid={ariaInvalid}
        className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13px] outline-none disabled:cursor-not-allowed"
        value={display}
        onChange={(e) => {
          if (disabled) return;
          isEditing.current = true;
          const sanitized = sanitizeCurrencyDisplayInput(e.target.value);
          setDisplay(sanitized);
          onValueChange(parseCurrencyInput(sanitized));
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

function DateInput({
  value,
  onChange,
  disabled,
  tone = "default",
  theme = "light",
  className,
  id,
  "aria-invalid": ariaInvalid,
  defaultToToday = true,
}: {
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  tone?: InputTone;
  theme?: "light" | "dark";
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  defaultToToday?: boolean;
}) {
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const didApplyDefault = React.useRef(false);
  const resolvedValue =
    value || (defaultToToday && !disabled ? todayISO() : "");

  React.useEffect(() => {
    if (
      defaultToToday &&
      !disabled &&
      !value &&
      onChange &&
      !didApplyDefault.current
    ) {
      didApplyDefault.current = true;
      onChange({
        target: { value: todayISO() },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [defaultToToday, disabled, onChange, value]);

  const dateTone: InputTone = disabled ? "readonly" : tone;
  const shell = theme === "dark" ? darkShellClass[dateTone] : toneShellClass[dateTone];

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
        {formatDateLabel(resolvedValue, defaultToToday ? formatDateLabel(todayISO()) : "Select date")}
        <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      <input
        ref={dateInputRef}
        id={id}
        type="date"
        value={resolvedValue}
        disabled={disabled}
        onChange={onChange}
        className="pointer-events-none absolute inset-0 opacity-0"
        tabIndex={-1}
        aria-hidden
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
  defaultToToday,
  ...props
}: React.ComponentProps<"input"> & {
  mode?: InputMode;
  tone?: InputTone;
  theme?: "light" | "dark";
  onValueChange?: (value: number) => void;
  defaultToToday?: boolean;
}) {
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
    const dateValue = typeof props.value === "string" ? props.value : "";
    return (
      <DateInput
        value={dateValue}
        onChange={props.onChange}
        disabled={disabled}
        tone={tone}
        theme={theme}
        className={className}
        id={id}
        aria-invalid={ariaInvalid as boolean | undefined}
        defaultToToday={defaultToToday}
      />
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

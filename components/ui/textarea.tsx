import * as React from "react"

import { cn } from "@/lib/utils"

const darkShellClass = "border-slate-600 text-slate-100"

const lightShellClass = "border-[#E0E0E0] bg-white text-gray-900"

type TextareaProps = React.ComponentProps<"textarea"> & {
  showCount?: boolean;
  theme?: "light" | "dark";
};

function Textarea({ className, showCount, value, maxLength, theme = "light", ...props }: TextareaProps) {
  const shouldShowCount = showCount && maxLength != null && typeof value === "string";

  const textarea = (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-[80px] w-full rounded-[4px] border px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-gray-400 focus-visible:border-[#2563eb] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-100",
        theme === "dark" ? darkShellClass : lightShellClass,
        shouldShowCount && "pb-7",
        className,
      )}
      value={value}
      maxLength={maxLength}
      {...props}
    />
  );

  if (shouldShowCount) {
    const atLimit = value.length >= maxLength;
    return (
      <div className="relative">
        {textarea}
        <span
          className={cn(
            "pointer-events-none absolute right-2 bottom-1.5 text-[10px] leading-none",
            atLimit ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {value.length}/{maxLength}
        </span>
      </div>
    );
  }

  return textarea;
}

export { Textarea }

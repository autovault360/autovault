import * as React from "react"

import { cn } from "@/lib/utils"

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
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        shouldShowCount && "pb-7",
        theme === "dark" ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900",
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
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

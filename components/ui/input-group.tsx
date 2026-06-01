"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type InputGroupTone = "default" | "readonly";
type InputGroupTheme = "light" | "dark";

const groupShellClass: Record<InputGroupTheme, Record<InputGroupTone, string>> = {
  light: {
    default: "border-[#E0E0E0] bg-white",
    readonly: "border-[#E0E0E0]",
  },
  dark: {
    default: "border-slate-600",
    readonly: "border-slate-600 bg-slate-800/50",
  },
};

const addonClass: Record<InputGroupTheme, string> = {
  light: "text-gray-500",
  dark: "text-white",
};

function InputGroup({
  className,
  theme = "light",
  tone = "default",
  disabled,
  ...props
}: React.ComponentProps<"div"> & {
  theme?: InputGroupTheme;
  tone?: InputGroupTone;
  disabled?: boolean;
}) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "flex h-8 w-full min-w-0 items-center rounded-[4px] border transition-colors",
        groupShellClass[theme][tone],
        "focus-within:border-[#2563eb]",
        disabled && "cursor-not-allowed opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  theme = "light",
  ...props
}: React.ComponentProps<"div"> & { theme?: InputGroupTheme }) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "flex shrink-0 items-center px-2.5 text-[13px]",
        addonClass[theme],
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  theme,
  ...props
}: React.ComponentProps<"input"> & { theme?: InputGroupTheme }) {
  return (
    <Input
      data-slot="input-group-control"
      theme={theme}
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent px-2.5 shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };

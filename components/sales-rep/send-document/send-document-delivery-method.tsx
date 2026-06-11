"use client";

import { Send, Link2, Upload, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { DeliveryMethod } from "@/lib/sales-rep/send-document/types";

type Props = {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
};

const OPTIONS: {
  value: DeliveryMethod;
  label: string;
  description: string;
  icon: typeof Send;
  pro?: boolean;
}[] = [
  {
    value: "email",
    label: "Email",
    description: "Send via email to the recipient",
    icon: Send,
  },
  {
    value: "secure_link",
    label: "Secure Link",
    description: "Generate a secure link to share",
    icon: Link2,
  },
  {
    value: "upload_portal",
    label: "Upload to Portal",
    description: "Upload to buyer portal (requires account)",
    icon: Upload,
    pro: true,
  },
];

export default function SendDocumentDeliveryMethod({ value, onChange }: Props) {
  return (
    <section className="rounded-xl border border-slate-800/80 bg-[#0f1520] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-400">
          <Send className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-[13px] font-semibold text-white">Delivery Method</h3>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as DeliveryMethod)}
        className="space-y-2"
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition",
                selected
                  ? "border-violet-500/50 bg-violet-500/5"
                  : "border-slate-800 bg-slate-900/30 hover:border-slate-700",
                option.pro && "opacity-90",
              )}
            >
              <RadioGroupItem
                value={option.value}
                className="mt-0.5 border-slate-600 data-checked:border-violet-500 data-checked:bg-violet-600"
              />
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-slate-400">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-white">
                    {option.label}
                  </span>
                  {option.pro && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-violet-600/20 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">
                      <Sparkles className="h-2.5 w-2.5" />
                      Pro
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[10.5px] text-slate-500">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}

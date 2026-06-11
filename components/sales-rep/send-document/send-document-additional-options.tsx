"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  requireConfirmation: boolean;
  notifyOnView: boolean;
  onRequireConfirmationChange: (value: boolean) => void;
  onNotifyOnViewChange: (value: boolean) => void;
};

function OptionCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2.5 transition hover:border-slate-700"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 accent-violet-500"
      />
      <span className="text-[12px] text-slate-300">{label}</span>
    </label>
  );
}

export default function SendDocumentAdditionalOptions({
  requireConfirmation,
  notifyOnView,
  onRequireConfirmationChange,
  onNotifyOnViewChange,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-800/80 bg-[#0f1520] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-400",
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-[13px] font-semibold text-white">
          Additional Options
        </h3>
      </div>

      <div className="space-y-2">
        <OptionCheckbox
          id="require-confirmation"
          label="Require recipient confirmation"
          checked={requireConfirmation}
          onChange={onRequireConfirmationChange}
        />
        <OptionCheckbox
          id="notify-on-view"
          label="Notify me when document is viewed"
          checked={notifyOnView}
          onChange={onNotifyOnViewChange}
        />
      </div>
    </section>
  );
}

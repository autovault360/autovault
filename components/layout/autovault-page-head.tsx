import { ReactNode } from "react";
import { AV } from "@/lib/ui/autovault-design-tokens";

export default function AutovaultPageHead({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="mb-[18px] mt-[22px] flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <div
          className="text-[13px] font-bold tracking-[3px]"
          style={{ color: AV.muted }}
        >
          {eyebrow.toUpperCase()}{" "}
          <b
            className="mt-1 block text-[26px] font-extrabold tracking-[1px]"
            style={{ color: AV.text }}
          >
            {title.toUpperCase()}
          </b>
        </div>
        <div className="mt-1 text-[12.5px]" style={{ color: AV.muted }}>
          {subtitle}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

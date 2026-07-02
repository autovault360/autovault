import { cn } from "@/lib/utils";
import { AV } from "@/lib/ui/autovault-design-tokens";

export default function SectionHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-[14px] mt-[30px] flex flex-wrap items-baseline justify-between gap-2",
        className,
      )}
    >
      <h2 className="m-0 text-base font-extrabold text-[#e7ecf3]">{title}</h2>
      {subtitle ? (
        <div className="text-xs" style={{ color: AV.muted }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

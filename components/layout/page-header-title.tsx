import { cn } from "@/lib/utils";

export const PAGE_HEADER_TITLE_CLASS =
  "text-xl font-bold tracking-[0.12em] text-white";

export const PAGE_HEADER_SUBTITLE_CLASS =
  "mt-0.5 text-[12px] text-slate-500";

type PageHeaderTitleProps = {
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function PageHeaderTitle({
  title,
  subtitle,
  as: Tag = "h1",
  className,
  titleClassName,
  subtitleClassName,
}: PageHeaderTitleProps) {
  return (
    <div className={className}>
      <Tag className={cn(PAGE_HEADER_TITLE_CLASS, titleClassName)}>
        {title.toUpperCase()}
      </Tag>
      {subtitle ? (
        <p className={cn(PAGE_HEADER_SUBTITLE_CLASS, subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

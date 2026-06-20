const RANK_STYLES: Record<
  1 | 2 | 3,
  { border: string; text: string }
> = {
  1: { border: "border-yellow-500", text: "text-yellow-500" },
  2: { border: "border-slate-400", text: "text-slate-400" },
  3: { border: "border-amber-800", text: "text-amber-800" },
};

type Props = {
  rank: number;
  className?: string;
};

export default function SalesRepRankCell({ rank, className }: Props) {
  if (rank >= 1 && rank <= 3) {
    const style = RANK_STYLES[rank as 1 | 2 | 3];
    return (
      <span
        className={`inline-flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums ${style.border} ${style.text} ${className ?? ""}`}
      >
        {rank}
      </span>
    );
  }

  if (rank <= 0) {
    return <span className="text-slate-600">�€”</span>;
  }

  return (
    <span
      className={`inline-flex min-w-[24px] justify-center text-[13px] font-semibold tabular-nums text-slate-300 ${className ?? ""}`}
    >
      {rank}
    </span>
  );
}
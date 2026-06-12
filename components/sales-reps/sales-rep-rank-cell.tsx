import Image from "next/image";

const RANK_BADGES: Record<1 | 2 | 3, { src: string; alt: string }> = {
  1: { src: "/1st_rank.png", alt: "1st place" },
  2: { src: "/2nd_rank.png", alt: "2nd place" },
  3: { src: "/3rd_rank.png", alt: "3rd place" },
};

type Props = {
  rank: number;
  className?: string;
};

export default function SalesRepRankCell({ rank, className }: Props) {
  if (rank >= 1 && rank <= 3) {
    const badge = RANK_BADGES[rank as 1 | 2 | 3];
    return (
      <Image
        src={badge.src}
        alt={badge.alt}
        width={36}
        height={44}
        className={`h-10 w-auto object-contain ${className ?? ""}`}
      />
    );
  }

  if (rank <= 0) {
    return <span className="text-slate-600">�</span>;
  }

  return (
    <span
      className={`inline-flex min-w-[24px] justify-center text-[13px] font-semibold tabular-nums text-slate-300 ${className ?? ""}`}
    >
      {rank}
    </span>
  );
}
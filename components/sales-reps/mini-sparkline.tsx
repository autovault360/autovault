"use client";

type Props = {
  color: string;
  points: string;
  id: string;
  className?: string;
  showDots?: boolean;
  showFill?: boolean;
};

function parsePoints(points: string) {
  return points.split(" ").map((p) => {
    const [x, y] = p.split(",").map(Number);
    return { x, y };
  });
}

export default function MiniSparkline({
  color,
  points,
  id,
  className = "h-6 w-16",
  showDots = true,
  showFill = true,
}: Props) {
  const coords = parsePoints(points);
  const safeId = id.replace(/[^a-zA-Z0-9-_]/g, "");

  return (
    <svg
      viewBox="0 0 220 50"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`mini-spark-fill-${safeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter
          id={`mini-spark-glow-${safeId}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.35" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showFill && (
        <polygon
          points={`0,50 ${points} 220,50`}
          fill={`url(#mini-spark-fill-${safeId})`}
        />
      )}

      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        filter={`url(#mini-spark-glow-${safeId})`}
      />

      {showDots &&
        coords.map(({ x, y }, index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={2.5}
            fill={color}
            filter={`url(#mini-spark-glow-${safeId})`}
          />
        ))}
    </svg>
  );
}

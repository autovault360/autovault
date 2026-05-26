import {
  formatCurrency,
  getGoalBarColorByStatus,
  type SalesRepPerformanceStatus,
} from "@/lib/sales-reps/types";

type Props = {
  goalAmount: number;
  goalProgress: number;
  status: SalesRepPerformanceStatus;
  repId: string;
};

export default function GoalProgressCell({
  goalAmount,
  goalProgress,
  status,
  repId,
}: Props) {
  const clampedProgress = Math.min(goalProgress, 100);

  return (
    <div className="min-w-[128px] py-0.5">
      <div className="text-[12.5px] font-semibold leading-tight text-white">
        {formatCurrency(goalAmount)}
      </div>
      <div className="mt-0.5 text-[10px] font-medium text-slate-500">
        {goalProgress}%
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
        <div
          className={`h-full rounded-full transition-all ${getGoalBarColorByStatus(status)}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={goalProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Goal progress for rep ${repId}`}
        />
      </div>
    </div>
  );
}

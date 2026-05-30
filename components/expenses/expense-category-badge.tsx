import { cn } from "@/lib/utils";
import {
  formatCategory,
  getCategoryStyle,
  type ExpenseCategory,
} from "@/lib/expenses/types";

export default function ExpenseCategoryBadge({
  category,
  className,
}: {
  category: ExpenseCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[10.5px] font-medium whitespace-nowrap",
        getCategoryStyle(category),
        className,
      )}
    >
      {formatCategory(category)}
    </span>
  );
}

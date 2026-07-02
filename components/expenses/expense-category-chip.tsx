import { formatCategory, type ExpenseCategory } from "@/lib/expenses/types";
import { getCategoryChipMeta } from "@/lib/expenses/expense-page-calculations";

export default function ExpenseCategoryChip({
  category,
}: {
  category: ExpenseCategory;
}) {
  const meta = getCategoryChipMeta(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-bold"
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: meta.dot }}
      />
      {formatCategory(category)}
    </span>
  );
}

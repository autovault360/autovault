"use client";

import { cn } from "@/lib/utils";
import { REPORTS_SIDEBAR_WIDTH_CLASS } from "./reports-constants";
import ReportsAiAssistant from "./reports-ai-assistant";
import StickyNotesCard from "./sticky-notes-card";
import type { ReportsRemindersMock } from "@/lib/reports-reminders/types";

type Props = {
  report: Pick<ReportsRemindersMock, "aiSuggestions" | "stickyNotes">;
  aiOpen: boolean;
  onAiOpenChange: (open: boolean) => void;
  className?: string;
};

export default function ReportsSidebar({
  report,
  aiOpen,
  onAiOpenChange,
  className,
}: Props) {
  if (!aiOpen) return null;

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col gap-3.5 self-start xl:sticky xl:top-5 xl:flex",
        REPORTS_SIDEBAR_WIDTH_CLASS,
        className,
      )}
    >
      <ReportsAiAssistant
        suggestions={report.aiSuggestions}
        onClose={() => onAiOpenChange(false)}
      />
      <StickyNotesCard notes={report.stickyNotes} />
    </aside>
  );
}

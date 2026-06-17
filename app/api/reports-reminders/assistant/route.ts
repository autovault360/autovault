import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_REPORTS_FILTERS, type ReportsFilters } from "@/lib/reports-reminders/types";
import { getReportsAiAnswer } from "@/lib/reports-reminders/server/report-command-center";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    question?: string;
    filters?: Partial<ReportsFilters>;
  } | null;

  const question = body?.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const filters: ReportsFilters = {
    ...DEFAULT_REPORTS_FILTERS,
    ...body?.filters,
  };

  const answer = await getReportsAiAnswer(question, filters);
  return NextResponse.json(answer);
}

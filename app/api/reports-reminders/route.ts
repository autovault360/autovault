import { NextRequest, NextResponse } from "next/server";
import { getReportsCommandCenterData } from "@/lib/reports-reminders/server/report-command-center";
import { filtersFromSearchParams } from "@/lib/reports-reminders/server/request-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const filters = filtersFromSearchParams(request.nextUrl.searchParams);
  const data = await getReportsCommandCenterData(filters);
  return NextResponse.json(data);
}

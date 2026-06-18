import { NextRequest, NextResponse } from "next/server";
import { getReportsDrilldown } from "@/lib/reports-reminders/server/report-command-center";
import {
  drilldownTypeFromSearchParams,
  filtersFromSearchParams,
} from "@/lib/reports-reminders/server/request-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = drilldownTypeFromSearchParams(searchParams);
  const filters = filtersFromSearchParams(searchParams);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");
  const sortBy = searchParams.get("sortBy") ?? undefined;
  const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

  const payload = await getReportsDrilldown(type, filters, {
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 25,
    sortBy,
    sortDirection,
  });

  return NextResponse.json(payload);
}

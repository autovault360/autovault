import { NextRequest, NextResponse } from "next/server";
import { exportReportsData } from "@/lib/reports-reminders/server/report-command-center";
import {
  drilldownTypeFromSearchParams,
  filtersFromSearchParams,
} from "@/lib/reports-reminders/server/request-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = drilldownTypeFromSearchParams(searchParams);
  const filters = filtersFromSearchParams(searchParams);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const exported = await exportReportsData(type, format, filters);

  return new NextResponse(exported.body, {
    headers: {
      "Content-Type": exported.contentType,
      "Content-Disposition": `attachment; filename="${exported.filename}"`,
    },
  });
}

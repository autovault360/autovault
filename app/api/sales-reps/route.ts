import { NextRequest, NextResponse } from "next/server";
import { getSalesRepsDashboard } from "@/lib/sales-reps/server/get-sales-reps-dashboard";
import { isSalesRepPeriod } from "@/lib/sales-reps/types";

export async function GET(request: NextRequest) {
  const periodParam = request.nextUrl.searchParams.get("period") ?? "this_month";
  const period = isSalesRepPeriod(periodParam) ? periodParam : "this_month";

  const data = await getSalesRepsDashboard(period);

  if (data.error) {
    return NextResponse.json(
      { error: data.error, salesReps: [], stats: data.stats },
      { status: data.error === "Authentication required" ? 401 : 500 },
    );
  }

  return NextResponse.json(data);
}

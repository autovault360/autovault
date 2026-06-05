import { NextRequest, NextResponse } from "next/server";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import { fetchCpaMonthlyFinancials } from "@/lib/cpa/server/get-monthly-financials";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  const { searchParams } = request.nextUrl;
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();
  const month = Number(searchParams.get("month") ?? String(defaultMonth));
  const year = Number(searchParams.get("year") ?? String(defaultYear));

  const data = await fetchCpaMonthlyFinancials(auth.user.dealershipId, {
    month: Number.isFinite(month) ? month : defaultMonth,
    year: Number.isFinite(year) ? year : defaultYear,
  });

  return NextResponse.json(data);
}

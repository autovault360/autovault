import { NextRequest, NextResponse } from "next/server";
import { fetchCpaDashboard } from "@/lib/cpa/server/get-dashboard";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import type { CpaViewMode } from "@/lib/cpa/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  const { searchParams } = request.nextUrl;
  const view = (searchParams.get("view") ?? "monthly") as CpaViewMode;
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();
  const month = Number(searchParams.get("month") ?? String(defaultMonth));
  const year = Number(searchParams.get("year") ?? String(defaultYear));

  const data = await fetchCpaDashboard(auth.user.dealershipId, {
    view: view === "yearly" ? "yearly" : "monthly",
    month: Number.isFinite(month) ? month : defaultMonth,
    year: Number.isFinite(year) ? year : defaultYear,
  });

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { requireDealJacketAuth } from "@/lib/deal-jackets/server/auth";
import { listDealJackets } from "@/services/deal-jacket.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");

  try {
    const result = await listDealJackets({
      dealershipId: auth.user.dealershipId,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 25,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

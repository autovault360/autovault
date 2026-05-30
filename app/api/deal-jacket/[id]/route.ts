import { NextRequest, NextResponse } from "next/server";
import { requireDealJacketAuth } from "@/lib/deal-jackets/server/auth";
import { getDealJacketById } from "@/services/deal-jacket.service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const detail = await getDealJacketById(id, auth.user.dealershipId);

  if (!detail) {
    return NextResponse.json({ error: "Deal jacket not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}

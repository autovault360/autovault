import { NextRequest, NextResponse } from "next/server";
import { getCustomerDetail } from "@/lib/customers/server/get-customer-detail";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(customer);
}

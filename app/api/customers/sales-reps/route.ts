import { NextResponse } from "next/server";
import { getSalesReps } from "@/lib/customers/server/get-customers";

export async function GET() {
  const salesReps = await getSalesReps();
  return NextResponse.json(salesReps);
}

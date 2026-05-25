import { NextRequest, NextResponse } from "next/server";
import { getVehicleDetail } from "@/lib/vehicles/get-vehicle-detail";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const vehicle = await getVehicleDetail(id);
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
  return NextResponse.json(vehicle);
}

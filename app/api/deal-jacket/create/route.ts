import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  canManageDealJackets,
  requireDealJacketAuth,
} from "@/lib/deal-jackets/server/auth";
import { createDealJacket } from "@/services/deal-jacket.service";

const createSchema = z.object({
  vehicleId: z.string().uuid(),
  customerId: z.string().uuid(),
  salesRepId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
  saleDate: z.string().min(1),
  soldPrice: z.coerce.number().positive(),
  totalTax: z.coerce.number().min(0).default(0),
  fees: z
    .object({
      license: z.coerce.number().optional(),
      registration: z.coerce.number().optional(),
      dmv: z.coerce.number().optional(),
      documentation: z.coerce.number().optional(),
      other: z.coerce.number().optional(),
    })
    .default({}),
  totalSalePrice: z.coerce.number().positive(),
  downPayment: z.coerce.number().min(0).optional(),
  amountFinanced: z.coerce.number().min(0).optional(),
  balanceDue: z.coerce.number().min(0).optional(),
  additionalExpenses: z.coerce.number().min(0).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!canManageDealJackets(auth.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await createDealJacket({
    dealershipId: auth.user.dealershipId,
    createdBy: auth.user.userId,
    sale: {
      vehicleId: parsed.data.vehicleId,
      customerId: parsed.data.customerId,
      salesRepId: parsed.data.salesRepId,
      dealId: parsed.data.dealId,
      saleDate: parsed.data.saleDate,
      soldPrice: parsed.data.soldPrice,
      totalTax: parsed.data.totalTax,
      fees: parsed.data.fees,
      totalSalePrice: parsed.data.totalSalePrice,
      downPayment: parsed.data.downPayment,
      amountFinanced: parsed.data.amountFinanced,
      balanceDue: parsed.data.balanceDue,
      additionalExpenses: parsed.data.additionalExpenses,
    },
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json(
    { dealJacket: result.dealJacket },
    { status: 201 },
  );
}

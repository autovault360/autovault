"use client";

import {
  Check,
  Phone,
  Mail,
  MapPin,
  FileText,
  Receipt,
  User,
} from "lucide-react";
import {
  formatCurrency,
  formatDisplayDate,
} from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import ExpenseDonut from "../expense-donut";
import {
  DetailCard,
  DetailCardHead,
  DetailCardBody,
  DetailLinkAction,
  DetailOutlineButton,
  DetailRow,
  YesBadge,
} from "../detail-primitives";

export default function OverviewTab({ detail }: { detail: DealJacketDetail }) {
  const moreDocs = detail.tabCounts.documents - detail.documents.length;
  const moreReceipts = detail.tabCounts.receipts - detail.receipts.length;

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4 xl:items-start">
      <div className="flex flex-col gap-3.5">
        <DetailCard>
          <DetailCardHead title="Sale Information" />
          <DetailCardBody>
            <DetailRow
              label="Sold Price"
              value={formatCurrency(detail.sale.soldPrice)}
            />
            <DetailRow
              label="Sales Tax"
              value={formatCurrency(detail.sale.salesTax)}
            />
            <DetailRow
              label="License Fee"
              value={formatCurrency(detail.sale.licenseFee)}
            />
            <DetailRow
              label="Registration Fee"
              value={formatCurrency(detail.sale.registrationFee)}
            />
            <DetailRow
              label="DMV Fees"
              value={formatCurrency(detail.sale.dmvFees)}
            />
            <DetailRow
              label="Documentation Fee"
              value={formatCurrency(detail.sale.documentationFee)}
            />
            <DetailRow
              label="Total Sale Price"
              value={formatCurrency(detail.sale.totalSalePrice)}
              highlight
            />
            <div className="my-2 border-t border-slate-800" />
            <DetailRow
              label="Down Payment"
              value={formatCurrency(detail.sale.downPayment)}
            />
            <DetailRow
              label="Amount Financed"
              value={formatCurrency(detail.sale.amountFinanced)}
            />
            <DetailRow
              label="Payment Method"
              value={detail.sale.paymentMethodLabel}
            />
            <DetailRow
              label="Date Sold"
              value={formatDisplayDate(detail.sale.dateSold)}
            />
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead
            title="Expense Breakdown"
            action={<DetailLinkAction href="#" label="View All Expenses" />}
          />
          <DetailCardBody>
            <ExpenseDonut
              center={formatCurrency(detail.financial.vehicleExpenses)}
              label="Total Expenses"
              segments={detail.expenseBreakdown.map((e) => ({
                color: e.color,
                value: e.percent,
              }))}
              breakdown={detail.expenseBreakdown}
            />
          </DetailCardBody>
        </DetailCard>
      </div>

      <div className="flex flex-col gap-3.5">
        <DetailCard>
          <DetailCardHead title="Customer Information" />
          <DetailCardBody>
            <p className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-white">
              <User className="h-3.5 w-3.5 text-slate-500" />
              {detail.customer.name}
            </p>
            <InfoLine icon={Phone} text={detail.customer.phone} />
            <InfoLine icon={Mail} text={detail.customer.email} />
            <InfoLine icon={MapPin} text={detail.customer.address} />
            <DetailOutlineButton
              href="/dashboard/customers"
              label="View Customer Profile"
            />
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead title="Documents" />
          <DetailCardBody>
            <ul className="space-y-2.5">
              {detail.documentChecklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-[var(--accent-green)]" />
                  <span className="flex-1 text-[11px] text-slate-300">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--accent-green)]">
                    {item.uploaded ? "Uploaded" : "Missing"}
                  </span>
                </li>
              ))}
            </ul>
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead title="Financial Summary" />
          <DetailCardBody>
            <DetailRow
              label="Purchase Price"
              value={formatCurrency(detail.financial.purchasePrice)}
            />
            <DetailRow
              label="Total Expenses"
              value={formatCurrency(detail.financial.vehicleExpenses)}
            />
            <DetailRow
              label="Total Invested"
              value={formatCurrency(detail.financial.totalInvested)}
            />
            <DetailRow
              label="Total Sale Price"
              value={formatCurrency(detail.financial.totalSalePrice)}
            />
            <DetailRow
              label="Gross Profit"
              value={formatCurrency(detail.financial.grossProfit)}
              valueClassName="text-[var(--accent-green)]"
            />
            <DetailRow
              label="Commission Deduction"
              value={formatCurrency(detail.financial.commissionDeduction)}
            />
            <DetailRow
              label="Other Costs"
              value={formatCurrency(detail.financial.additionalCosts)}
            />
            <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
              <div className="text-[10.5px] text-slate-500">Net Profit</div>
              <div className="mt-1 text-[20px] font-bold leading-none text-[var(--accent-green)]">
                {formatCurrency(detail.financial.netProfit)}
              </div>
            </div>
          </DetailCardBody>
        </DetailCard>
      </div>

      <div className="flex flex-col gap-3.5">
        <DetailCard>
          <DetailCardHead title="Sales Information" />
          <DetailCardBody>
            <DetailRow label="Sales Rep" value={detail.salesRep.name} />
            <DetailRow
              label="Commission Amount"
              value={formatCurrency(detail.salesRep.commissionAmount)}
            />
            <DetailRow label="Commission Paid" value={<YesBadge />} />
            <DetailRow
              label="Date Sold"
              value={formatDisplayDate(detail.sale.dateSold)}
            />
            <DetailOutlineButton
              href="/dashboard/sales-reps"
              label="View Sales Rep Profile"
            />
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead title="Vehicle Information" />
          <DetailCardBody>
            <DetailRow label="Vehicle" value={detail.vehicle.displayName} />
            <DetailRow label="Stock #" value={detail.vehicle.stockNumber} />
            <DetailRow label="VIN" value={detail.vehicle.vin} />
            <DetailRow
              label="Mileage"
              value={`${detail.vehicle.mileage.toLocaleString()} mi`}
            />
            <DetailRow label="Color" value={detail.vehicle.color} />
            <DetailOutlineButton
              href={`/dashboard/vehicles/${detail.vehicleId}`}
              label="View Vehicle Details"
            />
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead title="Commission Summary" />
          <DetailCardBody>
            <DetailRow
              label="Commission Amount"
              value={formatCurrency(detail.salesRep.commissionAmount)}
            />
            <DetailRow label="Commission Paid" value={<YesBadge />} />
            <DetailRow
              label="Date Paid"
              value={
                detail.salesRep.commissionPaidDate
                  ? formatDisplayDate(detail.salesRep.commissionPaidDate)
                  : "—"
              }
            />
            <DetailRow
              label="Payment Method"
              value={detail.salesRep.commissionPaymentMethod}
            />
            <DetailRow
              label="Transaction ID"
              value={
                <span className="font-mono text-[10px] text-slate-300">
                  {detail.salesRep.transactionId ?? "—"}
                </span>
              }
            />
          </DetailCardBody>
        </DetailCard>
      </div>

      <div className="flex flex-col gap-3.5">
        <DetailCard>
          <DetailCardHead
            title="Documents"
            action={<DetailLinkAction href="#" label="View All" />}
          />
          <DetailCardBody>
            <FileList items={detail.documents} />
            {moreDocs > 0 && (
              <p className="mt-2.5 text-[10.5px] font-medium text-[var(--accent)]">
                + {moreDocs} more documents
              </p>
            )}
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead
            title="Receipts"
            action={<DetailLinkAction href="#" label="View All" />}
          />
          <DetailCardBody>
            <FileList items={detail.receipts} icon={Receipt} />
            {moreReceipts > 0 && (
              <p className="mt-2.5 text-[10.5px] font-medium text-[var(--accent)]">
                + {moreReceipts} more receipts
              </p>
            )}
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardHead title="Notes" />
          <DetailCardBody>
            <p className="text-[11.5px] leading-relaxed text-slate-300">
              {detail.dealNotes}
            </p>
            <p className="mt-4 border-t border-slate-800 pt-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
              Last updated by {detail.lastNoteBy},{" "}
              {formatNoteDateTime(detail.lastNoteAt)}
            </p>
          </DetailCardBody>
        </DetailCard>
      </div>
    </div>
  );
}

function formatNoteDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function InfoLine({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="mb-2 flex items-start gap-2.5 text-[11px] text-slate-400">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

function FileList({
  items,
  icon: Icon = FileText,
}: {
  items: DealJacketDetail["documents"];
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <ul>
      {items.map((file) => (
        <li
          key={file.id}
          className="flex items-center gap-2.5 border-b border-slate-800/60 py-2.5 last:border-0"
        >
          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-white">
            {file.name}
          </span>
          <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
            {formatDisplayDate(file.uploadedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { Button } from "@/components/ui/button";
import { uploadCustomerDocument } from "@/lib/customers/server/upload-customer-document";
import type { CustomerDetail } from "@/lib/customers/types";
import {
  formatCommunicationTypeProfile,
  formatCurrencyDecimal,
  formatDateTime,
  formatDisplayDate,
} from "@/lib/customers/types";
import type { CustomerDetailTab } from "../customer-detail-shell";

type Props = {
  customer: CustomerDetail;
  onTabChange: (tab: CustomerDetailTab) => void;
};

export default function ProfileOverviewTab({ customer, onTabChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadPending, startUpload] = useTransition();
  const summary = customer.profileSummary;

  const handleUpload = (file: File) => {
    startUpload(async () => {
      const result = await uploadCustomerDocument(customer.id, file);
      if (result.success) {
        toast.success("Document uploaded");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3 lg:items-start">
        <DetailCard>
          <DetailCardHead title="Customer Information" />
          <div className="space-y-0 px-1">
            <DetailRow label="Full Name" value={customer.name} />
            <DetailRow label="Phone Number" value={customer.phone || "..."} />
            <DetailRow label="Email Address" value={customer.email || "..."} />
            <DetailRow label="Address" value={customer.fullAddress} />
            <DetailRow
              label="Date of Birth"
              value={formatDisplayDate(customer.dateOfBirth)}
            />
            <DetailRow
              label="Driver License #"
              value={customer.driversLicenseNumber || "..."}
            />
            <DetailRow label="DL State" value={customer.state || "..."} />
            <DetailRow
              label="Notes"
              value={customer.latestNotePreview || "..."}
            />
          </div>
        </DetailCard>

        <DetailCard>
          <DetailCardHead
            title="Recent Deal Jackets"
            action={
              <button
                type="button"
                onClick={() => onTabChange("deals")}
                className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                View All
              </button>
            }
          />
          <div className="space-y-3">
            {customer.deals.length === 0 ? (
              <p className="text-[11.5px] text-slate-500">No deal jackets yet.</p>
            ) : (
              customer.deals.slice(0, 2).map((deal) => (
                <div
                  key={deal.id}
                  className="flex gap-3 rounded-sm border border-slate-800/80 bg-[#0b121f]/40 p-3"
                >
                  <div className="relative h-[56px] w-[84px] shrink-0 overflow-hidden rounded-md border border-slate-800 bg-[var(--bg-primary)]">
                    {deal.imageUrl ? (
                      <Image
                        src={deal.imageUrl}
                        alt={deal.vehicleName}
                        fill
                        className="object-cover"
                        sizes="84px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] text-slate-600">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[12.5px] font-semibold text-white">
                        {deal.vehicleName}
                      </p>
                      <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-400">
                        Sold
                      </span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-1 gap-0.5 text-[13px] text-slate-400">
                      <span>
                        Stock #:{" "}
                        <span className="text-slate-200">{deal.stockNumber}</span>
                      </span>
                      <span>
                        VIN:{" "}
                        <span className="font-mono text-slate-200">{deal.vin}</span>
                      </span>
                      <span>
                        Sold Date:{" "}
                        <span className="text-slate-200">
                          {formatDisplayDate(deal.saleDate)}
                        </span>
                      </span>
                      <span>
                        Sold Price:{" "}
                        <span className="text-slate-200">
                          {formatCurrencyDecimal(deal.soldPrice)}
                        </span>
                      </span>
                      <span>
                        Sales Rep:{" "}
                        <span className="text-slate-200">{deal.salesRepName}</span>
                      </span>
                    </div>
                    {deal.dealJacketId && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-2.5 h-7 border-slate-600 bg-transparent px-3 text-[13px] font-medium text-blue-400 hover:bg-slate-800/50"
                      >
                        <Link
                          href={`/dashboard/deal-jackets/${deal.dealJacketId}`}
                        >
                          View Jacket
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            {customer.deals.length > 0 && (
              <button
                type="button"
                onClick={() => onTabChange("deals")}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
              >
                View All Deal Jackets ...
              </button>
            )}
          </div>
        </DetailCard>

        <div className="flex flex-col gap-3.5">
          <DetailCard>
            <DetailCardHead title="Customer Summary" />
            <div className="space-y-0 px-1">
              <DetailRow
                label="Total Vehicles Purchased"
                value={summary.totalVehiclesPurchased}
              />
              <DetailRow
                label="Total Spent"
                value={formatCurrencyDecimal(summary.totalSpent)}
              />
              <DetailRow
                label="Average Purchase Amount"
                value={formatCurrencyDecimal(summary.averagePurchaseAmount)}
              />
              <DetailRow
                label="Last Purchase Date"
                value={formatDisplayDate(summary.lastPurchaseDate)}
              />
              <DetailRow
                label="First Purchase Date"
                value={formatDisplayDate(summary.firstPurchaseDate)}
              />
              <DetailRow
                label="Deals in Progress"
                value={summary.dealsInProgress}
              />
              <DetailRow
                label="Open Balance"
                value={formatCurrencyDecimal(summary.openBalance)}
              />
            </div>
          </DetailCard>

          <DetailCard>
            <DetailCardHead
              title="Notes"
              action={
                <button
                  type="button"
                  onClick={() => onTabChange("notes")}
                  className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  View All
                </button>
              }
            />
            <div className="space-y-3">
              {customer.notes.length === 0 ? (
                <p className="text-[11.5px] text-slate-500">No notes yet.</p>
              ) : (
                customer.notes.slice(0, 2).map((note) => (
                  <div key={note.id} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                    <p className="text-[11px] text-slate-500">
                      {formatDisplayDate(note.createdAt)}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-300">
                      {note.body}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {note.authorName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DetailCard>
        </div>
      </div>

      <DetailCard>
        <DetailCardHead
          title="Documents"
          action={
            <button
              type="button"
              onClick={() => onTabChange("documents")}
              className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              View All
            </button>
          }
        />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {customer.documents.slice(0, 4).map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-[120px] shrink-0 flex-col items-center gap-2 rounded-md border border-slate-700/80 bg-[#0b121f]/50 p-3 transition hover:border-slate-600"
            >
              <div className="grid h-10 w-10 place-items-center rounded-md bg-red-500/15">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <span className="line-clamp-2 text-center text-[13px] font-medium text-white">
                {doc.label}
              </span>
              <span className="text-[9.5px] text-slate-500">
                {formatDisplayDate(doc.createdAt)}
              </span>
            </a>
          ))}
          <button
            type="button"
            disabled={uploadPending}
            onClick={() => fileRef.current?.click()}
            className="flex h-[120px] w-[120px] shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-600 bg-transparent text-slate-500 transition hover:border-slate-500 hover:text-slate-400"
          >
            {uploadPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Plus className="h-6 w-6" />
                <span className="text-[13px] font-medium">Upload</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </DetailCard>

      <DetailCard>
        <DetailCardHead
          title="Communication History"
          action={
            <button
              type="button"
              onClick={() => onTabChange("communications")}
              className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              View All
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-700 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-3 font-medium">Date / Time</th>
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 font-medium">Subject</th>
                <th className="pb-2 pr-3 font-medium">By</th>
                <th className="pb-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {customer.communications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-slate-500"
                  >
                    No communications logged yet.
                  </td>
                </tr>
              ) : (
                customer.communications.slice(0, 5).map((comm, i) => (
                  <tr
                    key={comm.id}
                    className={
                      i % 2 === 0
                        ? "border-b border-slate-800/60 bg-[#0b121f]/20"
                        : "border-b border-slate-800/60"
                    }
                  >
                    <td className="py-2.5 pr-3 text-slate-300">
                      {formatDateTime(comm.occurredAt)}
                    </td>
                    <td className="py-2.5 pr-3 text-blue-400">
                      {formatCommunicationTypeProfile(comm.type)}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-white">
                      {comm.subject || "..."}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-300">
                      {comm.authorName}
                    </td>
                    <td className="max-w-[200px] truncate py-2.5 text-slate-400">
                      {comm.body}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DetailCard>
    </div>
  );
}

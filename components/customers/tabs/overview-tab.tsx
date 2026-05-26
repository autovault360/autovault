"use client";

import Image from "next/image";
import {
  formatCurrency,
  formatCustomerSource,
  formatCustomerStatus,
  formatCustomerType,
  formatDisplayDate,
  formatLocation,
  type CustomerDetail,
} from "@/lib/customers/types";
import ActivityTimeline from "../activity-timeline";
import CustomerStatusBadge from "../customer-status-badge";

export default function OverviewTab({
  customer,
  onViewDeals,
  onViewActivity,
}: {
  customer: CustomerDetail;
  onViewDeals?: () => void;
  onViewActivity?: () => void;
}) {
  const latestNote = customer.notes[0];

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-slate-700/80 bg-[#0e1626]/60 p-4">
        <h4 className="mb-3 text-[11px] font-semibold text-white">Profile</h4>
        <div className="mb-3 flex items-center gap-3">
          {customer.imageUrl ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-700">
              <Image
                src={customer.imageUrl}
                alt={customer.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <div className="space-y-1">
            <CustomerStatusBadge status={customer.status} />
            <p className="text-[11px] text-slate-400">
              {formatCustomerType(customer.type)}
              {customer.source && ` • ${formatCustomerSource(customer.source)}`}
            </p>
            <p className="text-[11px] text-slate-400">
              Sales Rep: {customer.salesRepName}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-slate-700/80 bg-[#0e1626]/60 p-4">
        <h4 className="mb-3 text-[11px] font-semibold text-white">
          Contact Information
        </h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px]">
          <InfoItem label="Phone" value={customer.phone || "—"} />
          <InfoItem label="Email" value={customer.email || "—"} />
          <InfoItem
            label="Address"
            value={
              [customer.address, customer.address2].filter(Boolean).join(", ") ||
              "—"
            }
            className="col-span-2"
          />
          <InfoItem
            label="Location"
            value={formatLocation(customer.city, customer.state, customer.zip)}
            className="col-span-2"
          />
          <InfoItem
            label="Date of Birth"
            value={formatDisplayDate(customer.dateOfBirth)}
          />
          <InfoItem
            label="Driver's License"
            value={customer.driversLicenseNumber || "—"}
          />
          <InfoItem
            label="Status"
            value={formatCustomerStatus(customer.status)}
          />
          <InfoItem label="Source" value={formatCustomerSource(customer.source)} />
        </dl>
      </section>

      {latestNote && (
        <section className="rounded-md border border-slate-700/80 bg-[#0e1626]/60 p-4">
          <h4 className="mb-2 text-[11px] font-semibold text-white">
            Customer Notes
          </h4>
          <p className="text-[11.5px] leading-relaxed text-slate-300">
            {latestNote.body}
          </p>
          <p className="mt-2 text-[10.5px] text-slate-600">
            Added by {latestNote.authorName} ·{" "}
            {formatDisplayDate(latestNote.createdAt)}
          </p>
        </section>
      )}

      {customer.purchaseHistory.length > 0 && (
        <section className="rounded-md border border-slate-700/80 bg-[#0e1626]/60 p-4">
          <h4 className="mb-3 text-[11px] font-semibold text-white">
            Purchase History
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-700 text-slate-500">
                  <th className="pb-2 pr-2 font-medium">Stock #</th>
                  <th className="pb-2 pr-2 font-medium">Vehicle</th>
                  <th className="pb-2 pr-2 font-medium">Sale Date</th>
                  <th className="pb-2 pr-2 font-medium">Collected</th>
                  <th className="pb-2 font-medium">Gross Profit</th>
                </tr>
              </thead>
              <tbody>
                {customer.purchaseHistory.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-800/80 last:border-0"
                  >
                    <td className="py-2 pr-2 font-medium text-orange-400">
                      {p.stockNumber}
                    </td>
                    <td className="py-2 pr-2 text-white">{p.vehicleName}</td>
                    <td className="py-2 pr-2 text-slate-400">
                      {formatDisplayDate(p.saleDate)}
                    </td>
                    <td className="py-2 pr-2 text-slate-300">
                      {formatCurrency(p.salePrice)}
                    </td>
                    <td className="py-2 font-medium text-emerald-400">
                      {formatCurrency(p.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {onViewDeals && (
            <button
              type="button"
              onClick={onViewDeals}
              className="mt-3 text-[11px] font-medium text-blue-400 hover:text-blue-300"
            >
              View Full Purchase History →
            </button>
          )}
        </section>
      )}

      <section className="rounded-md border border-slate-700/80 bg-[#0e1626]/60 p-4">
        <h4 className="mb-3 text-[11px] font-semibold text-white">
          Recent Activity
        </h4>
        <ActivityTimeline items={customer.activityTimeline.slice(0, 5)} />
        {customer.activityTimeline.length > 0 && onViewActivity && (
          <button
            type="button"
            onClick={onViewActivity}
            className="mt-3 text-[11px] font-medium text-blue-400 hover:text-blue-300"
          >
            View All Activity →
          </button>
        )}
      </section>
    </div>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value}</dd>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Mail, Phone, User } from "lucide-react";
import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import {
  DetailCard,
  DetailCardBody,
} from "./detail-primitives";

function ContactColumn({
  label,
  name,
  phone,
  email,
}: {
  label: string;
  name: string;
  phone: string;
  email: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        <User className="h-3 w-3 text-blue-400" />
        {label}
      </div>
      <p className="truncate text-[12.5px] font-semibold text-white">{name}</p>
      <div className="mt-1.5 space-y-1">
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Phone className="h-3 w-3 shrink-0 text-slate-500" />
          <span className="truncate">{phone || "--"}</span>
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Mail className="h-3 w-3 shrink-0 text-slate-500" />
          <span className="truncate">{email || "--"}</span>
        </p>
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-1.5 text-[12px]">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 truncate font-medium text-slate-200">{value}</span>
    </div>
  );
}

export default function DealJacketVehicleOverview({
  detail,
}: {
  detail: DealJacketDetail;
}) {
  return (
    <DetailCard className="h-full bg-card">
      <DetailCardBody className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-md border border-slate-700/80 bg-[var(--bg-primary)] sm:w-[200px]">
            {detail.vehicle.imageUrl ? (
              <Image
                src={detail.vehicle.imageUrl}
                alt={detail.vehicle.displayName}
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-slate-600">
                No image
              </div>
            )}
          </div>

          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <h2 className="text-[18px] font-bold leading-tight text-white">
                {detail.vehicle.displayName}
              </h2>
              <MetaLine label="Stock #" value={detail.vehicle.stockNumber} />
              <MetaLine
                label="VIN:"
                value={
                  <span className="font-mono text-[11px]">{detail.vehicle.vin}</span>
                }
              />
              <MetaLine
                label="Sold Date:"
                value={formatDisplayDate(detail.sale.dateSold)}
              />
              <MetaLine
                label="Vehicle Status:"
                value={<span className="text-emerald-400">Sold</span>}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ContactColumn
                label="Customer"
                name={detail.customer.name}
                phone={detail.customer.phone}
                email={detail.customer.email}
              />
              <ContactColumn
                label="Sales Rep"
                name={detail.salesRep.name}
                phone="--"
                email="--"
              />
            </div>
          </div>
        </div>
      </DetailCardBody>
    </DetailCard>
  );
}

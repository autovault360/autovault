import { notFound } from "next/navigation";
import { getVehicleDetail } from "@/lib/vehicles/get-vehicle-detail";
import { formatCurrency, formatField, formatMileage } from "@/lib/vehicles/types";
import PrintButton from "./print-button";

type Props = {
  params: Promise<{ id: string }>;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <span className="text-[11px] font-medium text-gray-900 text-right">
        {value === "" || value === null || value === undefined ? "..." : value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-300 pb-1">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

export default async function VehiclePrintPage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicleDetail(id);
  if (!vehicle) notFound();

  return (
    <html>
      <head>
        <title>Print ... {vehicle.displayTitle}</title>
        <style>{`
          @page { margin: 0.6in 0.5in; size: letter; }
          * { box-sizing: border-box; }
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .no-print { display: block; }
          @media print {
            .no-print { display: none !important; }
          }

          .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
          .print-grid-full { grid-column: 1 / -1; }

          .photo-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .photo-grid img { width: 100px; height: 75px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; }

          .notes-text { font-size: 11px; line-height: 1.6; color: #374151; white-space: pre-wrap; margin-top: 4px; }

          .badge { display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 8px; border-radius: 3px; }
          .badge-in-stock { background: #d1fae5; color: #065f46; }
          .badge-sold { background: #fee2e2; color: #991b1b; }
          .badge-attention { background: #fef3c7; color: #92400e; }
        `}</style>
      </head>
      <body>
        <div className="no-print" style={{ padding: "16px", textAlign: "center" }}>
          <PrintButton />
        </div>

        <div style={{ maxWidth: "816px", margin: "0 auto", padding: "0 8px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "2px solid #111", paddingBottom: "12px" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{vehicle.displayTitle}</h1>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0 0" }}>
                Stock #: {vehicle.stockNumber} &nbsp;..&nbsp; VIN: {vehicle.vin}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`badge ${vehicle.status === "In Stock" ? "badge-in-stock" : "badge-sold"}`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          {/* Vehicle Information */}
          <Section title="Vehicle Information">
            <div className="print-grid">
              <Row label="Year" value={vehicle.year} />
              <Row label="Make" value={formatField("make", vehicle.make)} />
              <Row
                label="Model"
                value={formatField("model", vehicle.model, vehicle.make)}
              />
              <Row label="Trim" value={vehicle.trim} />
              <Row
                label="Body Style"
                value={formatField("bodyStyle", vehicle.bodyStyle)}
              />
              <Row
                label="Exterior Color"
                value={formatField("exteriorColor", vehicle.exteriorColor)}
              />
              <Row
                label="Interior Color"
                value={formatField("interiorColor", vehicle.interiorColor)}
              />
              <Row label="Doors" value={vehicle.doors} />
              <Row
                label="Drivetrain"
                value={formatField("drivetrain", vehicle.drivetrain)}
              />
              <Row label="Mileage" value={formatMileage(vehicle.mileage)} />
              <Row label="Engine" value={vehicle.engine} />
              <Row label="Transmission" value={vehicle.transmission} />
              <Row
                label="Fuel Type"
                value={formatField("fuelType", vehicle.fuelType)}
              />
              <Row label="MPG" value={vehicle.mpg} />
            </div>
          </Section>

          {/* Location & Status */}
          <Section title="Location & Status">
            <div className="print-grid">
              <Row
                label="Lot Location"
                value={formatField("location", vehicle.location)}
              />
              <Row label="Days in Inventory" value={vehicle.daysInInventory} />
              <Row label="Date Acquired" value={vehicle.dateAcquired} />
              <Row
                label="Has Title"
                value={vehicle.titleReceived ? "Yes" : "No"}
              />
              <Row label="Last Updated" value={vehicle.lastUpdated} />
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="print-grid">
              <Row label="Asking Price" value={formatCurrency(vehicle.price)} />
              <Row label="Market Value" value={formatCurrency(vehicle.marketValue)} />
              <Row label="Acquisition Cost" value={formatCurrency(vehicle.cost)} />
              <Row label="Total Reconditioning" value={formatCurrency(vehicle.totalReconditioning)} />
              <Row label="Gross Profit" value={
                <span style={{ color: vehicle.grossProfit >= 0 ? "#059669" : "#dc2626", fontWeight: 600 }}>
                  {formatCurrency(vehicle.grossProfit)}
                </span>
              } />
              <Row label="Gross Profit %" value={
                <span style={{ color: vehicle.grossProfitPct >= 0 ? "#059669" : "#dc2626", fontWeight: 600 }}>
                  {vehicle.grossProfitPct.toFixed(1)}%
                </span>
              } />
            </div>
          </Section>

          {/* Expenses */}
          {vehicle.expenses.length > 0 && (
            <Section title="Reconditioning Expenses">
              <div className="print-grid">
                {vehicle.expenses.map((e, i) => (
                  <Row key={i} label={e.label} value={formatCurrency(e.amount)} />
                ))}
              </div>
            </Section>
          )}

          {/* Activity Log */}
          {vehicle.activityLog.length > 0 && (
            <Section title="Activity Log">
              <div style={{ fontSize: "10px" }}>
                {vehicle.activityLog.map((entry, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", padding: "3px 0" }}>
                    <span style={{ fontWeight: 500, color: "#374151" }}>{entry.title}</span>
                    <span style={{ color: "#9ca3af" }}>{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Notes */}
          {vehicle.notes && (
            <Section title="Notes">
              <p className="notes-text">{vehicle.notes}</p>
            </Section>
          )}

          {/* Photos */}
          {vehicle.images.length > 0 && (
            <Section title="Photos">
              <div className="photo-grid">
                {vehicle.images.map((url, i) => (
                  <img key={i} src={url} alt={`${vehicle.displayTitle} ${i + 1}`} />
                ))}
              </div>
            </Section>
          )}

          {/* Footer */}
          <div style={{ marginTop: "24px", borderTop: "1px solid #e5e7eb", paddingTop: "8px", fontSize: "9px", color: "#9ca3af", textAlign: "center" }}>
            Printed from AutoVault360 .. {vehicle.displayTitle} .. {vehicle.vin}
          </div>
        </div>
      </body>
    </html>
  );
}

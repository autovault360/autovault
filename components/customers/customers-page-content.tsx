"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import AdminHeader from "@/components/layout/AdminHeader";
import AddCustomerTrigger from "@/components/customers/add/add-customer-trigger";
import AddCustomerModal from "@/components/customers/add/add-customer-modal";
import CustomerStatsCards from "@/components/customers/customer-stats-cards";
import CustomersInventory from "@/components/customers/customers-inventory";
import { CustomersTableSkeleton } from "@/components/customers/customers-skeleton";

const CustomerDetailPanel = dynamic(
  () => import("@/components/customers/customer-detail-panel"),
  { ssr: false },
);
import type {
  CustomerDetail,
  CustomerListItem,
  CustomerStats,
  SalesRepOption,
} from "@/lib/customers/types";

type Props = {
  customers: CustomerListItem[];
  stats: CustomerStats;
  salesReps: SalesRepOption[];
  defaultOpen?: boolean;
  defaultEditId?: string;
};

export default function CustomersPageContent({
  customers,
  stats,
  salesReps,
  defaultOpen = false,
  defaultEditId,
}: Props) {
  const pathname = usePathname();

  const [addOpen, setAddOpen] = useState(defaultOpen);

  useEffect(() => {
    setAddOpen(defaultOpen);
  }, [defaultOpen]);

  const handleAddOpenChange = (next: boolean) => {
    setAddOpen(next);
    window.history.replaceState(null, "", next ? pathname + "?add=true" : pathname);
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerDetail | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [detailInitialTab, setDetailInitialTab] = useState<
    "overview" | "deals" | "communications" | "notes" | "documents"
  >("overview");

  useEffect(() => {
    if (!defaultEditId) return;
    NProgress.start();
    fetch(`/api/customers/${defaultEditId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setEditCustomer(data);
        NProgress.done();
      })
      .catch(() => NProgress.done());
  }, [defaultEditId]);

  const selectedItem =
    customers.find((c) => c.id === selectedId) ?? null;

  const handleCustomerSaved = useCallback(() => {
    setDetailRefreshKey((key) => key + 1);
  }, []);

  const handleSelect = useCallback((row: CustomerListItem) => {
    setDetailInitialTab("overview");
    setSelectedId((prev) => (prev === row.id ? null : row.id));
  }, []);

  const handleAddNote = useCallback((row: CustomerListItem) => {
    setDetailInitialTab("notes");
    setSelectedId(row.id);
    setDetailRefreshKey((key) => key + 1);
  }, []);

  const handleEdit = useCallback((detail: CustomerDetail) => {
    setEditCustomer(detail);
    window.history.replaceState(null, "", `?edit=${detail.id}`);
  }, []);

  return (
    <div className="relative">
      <AdminHeader onAddCustomer={() => handleAddOpenChange(true)} />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
            <div>
              <h1 className="text-2xl font-bold text-white">Customers</h1>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Manage customer relationships and deal history.
              </p>
            </div>
            <AddCustomerTrigger onClick={() => handleAddOpenChange(true)} />
          </section>

          <CustomerStatsCards stats={stats} />

          <Suspense fallback={<CustomersTableSkeleton />}>
            <CustomersInventory
              customers={customers}
              salesReps={salesReps}
              selectedId={selectedId}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onAddNote={handleAddNote}
              onRequestAdd={() => handleAddOpenChange(true)}
            />
          </Suspense>
        </div>

        {selectedId && selectedItem && (
          <CustomerDetailPanel
            customerId={selectedId}
            listItem={selectedItem}
            refreshKey={detailRefreshKey}
            initialTab={detailInitialTab}
            onListRefresh={handleCustomerSaved}
            onClose={() => setSelectedId(null)}
            onEdit={handleEdit}
          />
        )}
      </div>

      <AddCustomerModal
        open={addOpen}
        onOpenChange={handleAddOpenChange}
        salesReps={salesReps}
        onSaved={handleCustomerSaved}
      />
      {editCustomer && (
        <AddCustomerModal
          open={!!editCustomer}
          onOpenChange={(open) => {
            if (!open) {
              setEditCustomer(null);
              window.history.replaceState(null, "", pathname);
            }
          }}
          salesReps={salesReps}
          editCustomer={editCustomer}
          onSaved={handleCustomerSaved}
        />
      )}
    </div>
  );
}

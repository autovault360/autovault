"use client";

import { Suspense, useCallback, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import AddCustomerTrigger from "@/components/customers/add/add-customer-trigger";
import AddCustomerModal from "@/components/customers/add/add-customer-modal";
import CustomerStatsCards from "@/components/customers/customer-stats-cards";
import CustomersInventory from "@/components/customers/customers-inventory";
import CustomerDetailPanel from "@/components/customers/customer-detail-panel";
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
};

export default function CustomersPageContent({
  customers,
  stats,
  salesReps,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerDetail | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [detailInitialTab, setDetailInitialTab] = useState<
    "overview" | "deals" | "communications" | "notes" | "documents"
  >("overview");

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
  }, []);

  return (
    <div className="relative">
      <AdminHeader onAddCustomer={() => setAddOpen(true)} />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
            <div>
              <h1 className="text-2xl font-bold text-white">Customers</h1>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Manage customer relationships and deal history.
              </p>
            </div>
            <AddCustomerTrigger onClick={() => setAddOpen(true)} />
          </section>

          <CustomerStatsCards stats={stats} />

          <Suspense fallback={null}>
            <CustomersInventory
              customers={customers}
              salesReps={salesReps}
              selectedId={selectedId}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onAddNote={handleAddNote}
              onRequestAdd={() => setAddOpen(true)}
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
        onOpenChange={setAddOpen}
        salesReps={salesReps}
        onSaved={handleCustomerSaved}
      />
      {editCustomer && (
        <AddCustomerModal
          open={!!editCustomer}
          onOpenChange={(open) => !open && setEditCustomer(null)}
          salesReps={salesReps}
          editCustomer={editCustomer}
          onSaved={handleCustomerSaved}
        />
      )}
    </div>
  );
}

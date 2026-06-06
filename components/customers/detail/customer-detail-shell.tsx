"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import AddCustomerModal from "@/components/customers/add/add-customer-modal";
import CustomerStatusBadge from "@/components/customers/customer-status-badge";
import ActiveCustomerBadge from "@/components/customers/detail/active-customer-badge";
import CustomerHeroMetrics from "@/components/customers/detail/customer-hero-metrics";
import ProfileOverviewTab from "@/components/customers/detail/tabs/profile-overview-tab";
import ProfileVehiclesTab from "@/components/customers/detail/tabs/vehicles-tab";
import ProfileDocumentsTab from "@/components/customers/detail/tabs/documents-tab";
import ProfileDealsTab from "@/components/customers/detail/tabs/deals-tab";
import NotesTab from "@/components/customers/tabs/notes-tab";
import CommunicationsTab from "@/components/customers/tabs/communications-tab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CustomerDetail, SalesRepOption } from "@/lib/customers/types";
import { getCustomerInitials } from "@/lib/customers/types";

export type CustomerDetailTab =
  | "overview"
  | "vehicles"
  | "documents"
  | "deals"
  | "notes"
  | "communications";

const TABS: {
  id: CustomerDetailTab;
  label: string;
  countKey?:
    | "vehicles"
    | "documents"
    | "deals"
    | "notes"
    | "communications";
}[] = [
  { id: "overview", label: "Overview" },
  { id: "vehicles", label: "Vehicles", countKey: "vehicles" },
  { id: "documents", label: "Documents", countKey: "documents" },
  { id: "deals", label: "Deals / Deal Jackets", countKey: "deals" },
  { id: "notes", label: "Notes", countKey: "notes" },
  {
    id: "communications",
    label: "Communication History",
    countKey: "communications",
  },
];

type Props = {
  customer: CustomerDetail;
  salesReps: SalesRepOption[];
  fromDealJacketId?: string;
};

export default function CustomerDetailShell({
  customer: initialCustomer,
  salesReps,
  fromDealJacketId,
}: Props) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>("overview");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  const backHref = fromDealJacketId
    ? `/dashboard/deal-jackets/${fromDealJacketId}`
    : "/dashboard/customers";
  const backLabel = fromDealJacketId
    ? "Back to Deal Jacket"
    : "Back to Customers";

  const tabCounts = {
    vehicles: customer.vehicles.length,
    documents: customer.documents.length,
    deals: customer.deals.length,
    notes: customer.notes.length,
    communications: customer.communications.length,
  };

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleSaved = useCallback(() => {
    handleRefresh();
    setEditOpen(false);
  }, [handleRefresh]);

  return (
    <div className="relative pb-8">
      <AdminHeader />

      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <User className="h-5 w-5 text-slate-500" />
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
            Customer Profile
          </h1>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => setEditOpen(true)}
          className="h-9 gap-1.5 px-5 text-[12px] font-semibold"
        >
          Edit Customer
        </Button>
      </section>

      <Card className="mb-4 gap-0 rounded-lg border border-slate-800/90 bg-transparent py-0 shadow-none ring-0">
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 shrink-0 border-2 border-slate-700/80">
                {customer.imageUrl ? (
                  <AvatarImage
                    src={customer.imageUrl}
                    alt={customer.name}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-slate-800 text-2xl font-semibold text-white">
                  {getCustomerInitials(customer.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-bold text-white">
                    {customer.name}
                  </h2>
                  {customer.status === "customer" ? (
                    <ActiveCustomerBadge />
                  ) : (
                    <CustomerStatusBadge status={customer.status} />
                  )}
                </div>
                <div className="mt-2 space-y-1 text-[12.5px] text-slate-400">
                  {customer.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <span className="text-blue-400">{customer.email}</span>
                    </p>
                  )}
                  {customer.fullAddress !== "..." && (
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                      {customer.fullAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full shrink-0 lg:max-w-[min(100%,520px)] lg:flex-1">
              <CustomerHeroMetrics
                summary={customer.profileSummary}
                customerSince={customer.customerSince}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-[var(--border-subtle)]">
        {TABS.map((tab) => {
          const count =
            tab.countKey != null ? tabCounts[tab.countKey] : undefined;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-[12px] font-medium transition-colors",
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-slate-300",
              )}
            >
              {tab.label}
              {count != null && (
                <span className="ml-1 text-[var(--text-muted)]">({count})</span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <ProfileOverviewTab
          customer={customer}
          onTabChange={setActiveTab}
        />
      )}
      {activeTab === "vehicles" && (
        <ProfileVehiclesTab customer={customer} />
      )}
      {activeTab === "documents" && (
        <ProfileDocumentsTab customer={customer} onRefresh={handleRefresh} />
      )}
      {activeTab === "deals" && <ProfileDealsTab customer={customer} />}
      {activeTab === "notes" && (
        <NotesTab customer={customer} onRefresh={handleRefresh} />
      )}
      {activeTab === "communications" && (
        <CommunicationsTab customer={customer} onRefresh={handleRefresh} />
      )}

      <AddCustomerModal
        open={editOpen}
        onOpenChange={setEditOpen}
        salesReps={salesReps}
        editCustomer={customer}
        onSaved={handleSaved}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { getVehicleLabel } from "@/lib/dealer/inventory/map-wholesale-vehicle";
import { listWholesaleDocuments } from "@/lib/dealer/documents/server/list-wholesale-documents";
import { getWholesaleDocumentStats } from "@/lib/dealer/documents/server/get-wholesale-document-stats";
import type {
  WholesaleDocumentListParams,
  WholesaleDocumentsDashboardData,
} from "@/lib/dealer/documents/types";
import DocumentsStatsCards from "./documents-stats-cards";
import DocumentsFiltersBar from "./documents-filters-bar";
import DocumentsTable from "./documents-table";
import UploadDocumentWorkspace from "./upload-document-workspace";

type Props = WholesaleDocumentsDashboardData;

export default function DocumentsPageContent({ stats: initialStats, list: initialList }: Props) {
  const searchParams = useSearchParams();
  const { dashboardData } = useDealerDashboard();

  const [stats, setStats] = useState(initialStats);
  const [list, setList] = useState(initialList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<WholesaleDocumentListParams>({
    page: 1,
    pageSize: 6,
    documentType: "all",
    category: "all",
    status: "all",
    vehicleId: "all",
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    setUploadOpen(searchParams.get("upload") === "true");
  }, [searchParams]);

  const vehicleOptions = useMemo(() => {
    const vehicles = dashboardData?.vehicles ?? [];
    return vehicles.map((v) => ({
      id: v.id,
      label: `${getVehicleLabel(v)} (${v.stockNumber})`,
    }));
  }, [dashboardData?.vehicles]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextStats, nextList] = await Promise.all([
        getWholesaleDocumentStats(),
        listWholesaleDocuments({
          ...filters,
          search: debouncedSearch,
          includeDeleted: showDeleted,
        }),
      ]);
      setStats(nextStats);
      setList(nextList);
    } catch {
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, showDeleted]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFiltersChange = (partial: Partial<WholesaleDocumentListParams>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setShowDeleted(false);
    setFiltersOpen(false);
    setFilters({
      page: 1,
      pageSize: 6,
      documentType: "all",
      category: "all",
      status: "all",
      vehicleId: "all",
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div className={cn("grid grid-cols-1 items-start gap-4", uploadOpen ? "xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] 2xl:grid-cols-[minmax(0,1fr)_440px]" : "xl:grid-cols-1")}>
        {/* LEFT COLUMN - documents list */}
        <div className="min-w-0 space-y-3.5">
          <section className="flex flex-wrap items-start justify-between gap-3 px-0.5">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15">
                <FolderOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-[18px] font-bold tracking-tight text-white">Documents</h1>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  Manage bills of sale, titles, auction invoices, and dealer records.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="h-9 gap-1.5 bg-emerald-600 text-[12px] hover:bg-emerald-500"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Upload Document
            </Button>
          </section>

          <DocumentsStatsCards stats={stats} />

          <section className="overflow-hidden rounded-md">

            <div className="py-3">
              <DocumentsFiltersBar
                search={search}
                onSearchChange={setSearch}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                vehicles={vehicleOptions}
                filtersOpen={filtersOpen}
                onFiltersOpenChange={setFiltersOpen}
                onClearFilters={handleClearFilters}
                showDeleted={showDeleted}
                onShowDeletedChange={(v) => {
                  setShowDeleted(v);
                  setFilters((prev) => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div id="documents-table">
              {error ? (
                <div className="p-6 text-center">
                  <p className="text-[13px] text-red-300">{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 border-red-500/40 text-red-300"
                    onClick={fetchData}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <DocumentsTable
                  documents={list.items}
                  loading={loading}
                  onRefresh={fetchData}
                  showDeleted={showDeleted}
                />
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - upload panel (desktop) */}
        {uploadOpen && (
          <div className="hidden xl:block">
            <UploadDocumentWorkspace
              open
              onClose={() => setUploadOpen(false)}
              onSuccess={fetchData}
              variant="sidebar"
            />
          </div>
        )}
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 xl:hidden">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-xl">
            <UploadDocumentWorkspace
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
              onSuccess={fetchData}
              variant="sheet"
            />
          </div>
        </div>
      )}
    </div>
  );
}

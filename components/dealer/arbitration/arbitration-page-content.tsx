"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import ArbitrationStatsCards from "./arbitration-stats-cards";
import ArbitrationTable from "./arbitration-table";
import AddArbitrationNoteDialog from "./add-arbitration-note-dialog";
import type { ArbitrationDashboardData, ArbitrationRecord } from "@/lib/dealer/arbitration/types";

type Props = Pick<ArbitrationDashboardData, "records" | "stats" | "dealers" | "reasons">;

export default function ArbitrationPageContent({
  records,
  stats,
  dealers,
  reasons,
}: Props) {
  const router = useRouter();
  const [noteRecord, setNoteRecord] = useState<ArbitrationRecord | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const handleAddNote = (record: ArbitrationRecord) => {
    setNoteRecord(record);
    setNoteDialogOpen(true);
  };

  return (
    <>
      <DealerPageShell
        headerSection={
          <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 px-0.5 pb-3.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-orange-500/10 text-orange-400">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-[18px] font-bold uppercase tracking-wide text-white">
                    Arbitration
                  </h1>
                  <p className="mt-0.5 text-[12px] text-[#64748b]">
                    Vehicles with arbitration status from the inventory.
                  </p>
                </div>
              </div>
            </div>
          </section>
        }
      >
        <ArbitrationStatsCards stats={stats} />
        <ArbitrationTable
          records={records}
          dealers={dealers}
          reasons={reasons}
          onAddNote={handleAddNote}
        />
      </DealerPageShell>

      <AddArbitrationNoteDialog
        record={noteRecord}
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

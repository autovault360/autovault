"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import StickyNotesCard from "@/components/reports-reminders/sticky-notes-card";
import type { StickyNote } from "@/lib/reports-reminders/types";
import DashboardExpandableShell from "./dashboard-expandable-shell";

type Props = {
  notes: StickyNote[];
  dashboardPath?: string;
};

export default function StickyNotesSection({ notes, dashboardPath = "/dashboard" }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <DashboardExpandableShell
      sectionNumber={1}
      title="STICKY NOTES"
      defaultExpanded
      showSectionNumber={false}
      expandedToggleLabel="Hide Details"
      collapsedToggleLabel="View Details"
      headerActions={
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-[11px] text-blue-400 transition hover:text-blue-300"
        >
          <Plus className="h-3 w-3" />
          New Note
        </button>
      }
    >
      <StickyNotesCard
        notes={notes}
        noCard
        hideHeader
        dashboardPath={dashboardPath}
        showModal={showModal}
        onShowModalChange={setShowModal}
      />
    </DashboardExpandableShell>
  );
}

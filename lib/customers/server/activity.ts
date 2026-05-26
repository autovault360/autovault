type DealActivityRow = {
  sale_date: string;
  deleted_at?: string | null;
};

type NoteActivityRow = {
  created_at: string;
  deleted_at?: string | null;
};

type CommActivityRow = {
  occurred_at: string;
  type: string;
  deleted_at?: string | null;
};

export type CustomerActivityInput = {
  updated_at?: string;
  created_at?: string;
  deals?: DealActivityRow[];
  notes?: NoteActivityRow[];
  communications?: CommActivityRow[];
};

export function computeLastActivity(row: CustomerActivityInput): {
  date: string;
  label: string;
} {
  const candidates: { date: string; label: string; ts: number }[] = [];

  if (row.updated_at) {
    candidates.push({
      date: row.updated_at,
      label: "Profile updated",
      ts: new Date(row.updated_at).getTime(),
    });
  }

  for (const deal of row.deals ?? []) {
    if (deal.deleted_at) continue;
    candidates.push({
      date: deal.sale_date,
      label: "Purchased vehicle",
      ts: new Date(deal.sale_date).getTime(),
    });
  }

  for (const comm of row.communications ?? []) {
    if (comm.deleted_at) continue;
    const label =
      comm.type === "email"
        ? "Email sent"
        : comm.type === "call"
          ? "Phone call"
          : comm.type === "sms"
            ? "SMS sent"
            : comm.type === "meeting"
              ? "Meeting"
              : "Inquiry submitted";
    candidates.push({
      date: comm.occurred_at,
      label,
      ts: new Date(comm.occurred_at).getTime(),
    });
  }

  for (const note of row.notes ?? []) {
    if (note.deleted_at) continue;
    candidates.push({
      date: note.created_at,
      label: "Note added",
      ts: new Date(note.created_at).getTime(),
    });
  }

  if (candidates.length === 0) {
    return {
      date: row.created_at ?? new Date().toISOString(),
      label: "Customer created",
    };
  }

  candidates.sort((a, b) => b.ts - a.ts);
  return { date: candidates[0].date, label: candidates[0].label };
}

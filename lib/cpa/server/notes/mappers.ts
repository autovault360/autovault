import type {
  CpaNoteActivity,
  CpaNoteAttachment,
  CpaNoteComment,
  CpaNoteDetail,
  CpaNoteListItem,
  CpaNoteStatus,
  CpaNotesSummary,
} from "../../types";

type NoteRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  stock_number: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string | null;
  resolved_at?: string | null;
  is_archived: boolean;
  users?: { full_name: string | null; email: string } | null;
  assignee?: { full_name: string | null } | null;
};

export function mapNoteListItem(row: NoteRow): CpaNoteListItem {
  const creator = row.users;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as CpaNoteListItem["category"],
    priority: row.priority as CpaNoteListItem["priority"],
    status: row.status as CpaNoteStatus,
    stockNumber: row.stock_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdById: row.created_by,
    createdByName: creator?.full_name || creator?.email || "Unknown",
    isArchived: row.is_archived,
  };
}

export function mapNoteDetail(
  row: NoteRow,
  comments: CpaNoteComment[],
  attachments: CpaNoteAttachment[],
  activity: CpaNoteActivity[],
): CpaNoteDetail {
  const base = mapNoteListItem(row);
  return {
    ...base,
    assignedTo: row.assigned_to ?? null,
    assignedToName: row.assignee?.full_name ?? null,
    resolvedAt: row.resolved_at ?? null,
    comments,
    attachments,
    activity,
  };
}

export function computeNotesSummary(
  notes: { status: string; is_archived: boolean }[],
): CpaNotesSummary {
  const active = notes.filter((n) => !n.is_archived);
  return {
    total: active.length,
    open: active.filter((n) => n.status === "OPEN").length,
    inProgress: active.filter((n) => n.status === "IN_PROGRESS").length,
    resolved: active.filter((n) => n.status === "RESOLVED").length,
  };
}

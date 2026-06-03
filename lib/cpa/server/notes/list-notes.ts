import { createClient } from "@/lib/supabase/server";
import type { CpaNoteListItem, CpaNotesSummary } from "../../types";
import { cpaNotesQuerySchema } from "../../actions/schemas";
import { computeNotesSummary, mapNoteListItem } from "./mappers";

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const STATUS_ORDER: Record<string, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  ARCHIVED: 3,
};

export async function listCpaNotes(
  dealershipId: string,
  query: Record<string, string | undefined>,
): Promise<{ notes: CpaNoteListItem[]; summary: CpaNotesSummary }> {
  const parsed = cpaNotesQuerySchema.parse(query);
  const supabase = await createClient();

  let dbQuery = supabase
    .from("cpa_notes")
    .select(
      `
      id, title, description, category, priority, status,
      stock_number, created_at, updated_at, created_by, is_archived,
      users:created_by ( full_name, email )
    `,
    )
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false });

  if (parsed.status === "ARCHIVED") {
    dbQuery = dbQuery.eq("is_archived", true);
  } else {
    dbQuery = dbQuery.eq("is_archived", false);
    if (parsed.status && parsed.status !== "all") {
      dbQuery = dbQuery.eq("status", parsed.status);
    }
  }

  const { data, error } = await dbQuery;
  if (error) throw new Error(error.message);

  type Row = {
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
    is_archived: boolean;
    users?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  };

  let notes = ((data ?? []) as Row[]).map((row) =>
    mapNoteListItem({
      ...row,
      users: Array.isArray(row.users) ? row.users[0] : row.users ?? null,
    }),
  );

  const search = parsed.search?.trim().toLowerCase();
  if (search) {
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(search) ||
        n.description.toLowerCase().includes(search) ||
        (n.stockNumber?.toLowerCase().includes(search) ?? false) ||
        n.category.toLowerCase().includes(search),
    );
  }

  const sort = parsed.sort ?? "newest";
  notes.sort((a, b) => {
    if (sort === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === "priority") {
      return (
        (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      );
    }
    if (sort === "status") {
      return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const { data: allForSummary } = await supabase
    .from("cpa_notes")
    .select("status, is_archived")
    .eq("dealership_id", dealershipId);

  return {
    notes,
    summary: computeNotesSummary(allForSummary ?? []),
  };
}

"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCustomerNote } from "@/lib/customers/server/add-customer-activity";
import { formatDisplayDate, type CustomerDetail } from "@/lib/customers/types";

export default function NotesTab({
  customer,
  onRefresh,
  onListRefresh,
}: {
  customer: CustomerDetail;
  onRefresh: () => void;
  onListRefresh?: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await addCustomerNote({
        customerId: customer.id,
        body,
      });
      if (result.success) {
        toast.success("Note added");
        setBody("");
        router.refresh();
        onRefresh();
        onListRefresh?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-sm border border-slate-700 bg-[#0e1626]/50 p-3 space-y-2"
      >
        <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Add Note
        </h4>
        <Textarea
          placeholder="Internal notes about this customer..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="border-slate-700 bg-[#010d19] text-[11.5px] text-slate-200"
          required
        />
        <Button
          type="submit"
          size="sm"
          disabled={pending || !body.trim()}
          className="h-8 bg-blue-600 text-[11.5px] hover:bg-blue-500"
        >
          {pending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
          Save Note
        </Button>
      </form>

      <div className="space-y-2">
        {customer.notes.length === 0 ? (
          <p className="text-[11.5px] text-slate-500">No notes yet.</p>
        ) : (
          customer.notes.map((note) => (
            <div
              key={note.id}
              className="rounded-sm border border-slate-700 bg-[#0e1626]/30 p-3"
            >
              <p className="text-[11.5px] leading-relaxed text-slate-300">
                {note.body}
              </p>
              <p className="mt-2 text-[10.5px] text-slate-600">
                {note.authorName} · {formatDisplayDate(note.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

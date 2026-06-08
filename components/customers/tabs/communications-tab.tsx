"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addCustomerCommunication } from "@/lib/customers/server/add-customer-activity";
import {
  COMMUNICATION_TYPES,
  formatCommunicationType,
  formatDisplayDate,
  type CommunicationType,
  type CustomerDetail,
} from "@/lib/customers/types";

export default function CommunicationsTab({
  customer,
  onRefresh,
  onListRefresh,
}: {
  customer: CustomerDetail;
  onRefresh: () => void;
  onListRefresh?: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<CommunicationType>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await addCustomerCommunication({
        customerId: customer.id,
        type,
        subject,
        body,
      });
      if (result.success) {
        toast.success("Communication logged");
        setSubject("");
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
        <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Log Communication
        </h4>
        <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
          <SelectTrigger theme="dark" className="h-8 text-[11.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent theme="dark">
            {COMMUNICATION_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-[11.5px]">
                {formatCommunicationType(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-8 border-slate-700 bg-[#010d19] text-[11.5px] text-slate-200"
        />
        <Textarea
          placeholder="Message or call notes..."
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
          Add Entry
        </Button>
      </form>

      <div className="space-y-2">
        {customer.communications.length === 0 ? (
          <p className="text-[11.5px] text-slate-500">No communications yet.</p>
        ) : (
          customer.communications.map((comm) => (
            <div
              key={comm.id}
              className="rounded-sm border border-slate-700 bg-[#0e1626]/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-blue-400">
                  {formatCommunicationType(comm.type)}
                </span>
                <span className="text-[13px] text-slate-600">
                  {formatDisplayDate(comm.occurredAt)}
                </span>
              </div>
              {comm.subject && (
                <div className="mt-1 text-[12px] font-medium text-white">
                  {comm.subject}
                </div>
              )}
              <p className="mt-1 text-[11px] text-slate-400">{comm.body}</p>
              <p className="mt-1.5 text-[10px] text-slate-600">
                {comm.authorName}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { Mail, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RecipientType, SalesRepOption } from "@/lib/sales-rep/send-document/types";
import SendDocumentSectionCard from "./send-document-section-card";

type Props = {
  recipientType: RecipientType;
  emailAddresses: string;
  salesRepId: string;
  salesReps: SalesRepOption[];
  recipientError: string | null;
  onRecipientTypeChange: (type: RecipientType) => void;
  onEmailChange: (value: string) => void;
  onSalesRepChange: (value: string) => void;
  onRecipientBlur: () => void;
};

export default function SendDocumentRecipientSection({
  recipientType,
  emailAddresses,
  salesRepId,
  salesReps,
  recipientError,
  onRecipientTypeChange,
  onEmailChange,
  onSalesRepChange,
  onRecipientBlur,
}: Props) {
  return (
    <SendDocumentSectionCard step={1} title="Select Recipient">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRecipientTypeChange("email")}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
            recipientType === "email"
              ? "border-emerald-500/70 bg-emerald-500/5 ring-1 ring-emerald-500/30"
              : "border-slate-700/80 bg-slate-900/30 hover:border-slate-600",
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
              recipientType === "email"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-slate-800 text-slate-400",
            )}
          >
            <Mail className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-white">
              Email
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Send to any email address
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onRecipientTypeChange("sales_rep")}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
            recipientType === "sales_rep"
              ? "border-blue-500/70 bg-blue-500/5 ring-1 ring-blue-500/30"
              : "border-slate-700/80 bg-slate-900/30 hover:border-slate-600",
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
              recipientType === "sales_rep"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-slate-800 text-slate-400",
            )}
          >
            <UserRound className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-white">
              Sales Rep
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Send directly to a sales rep
            </span>
          </span>
        </button>
      </div>

      {recipientType === "email" ? (
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
            Email Address <span className="text-red-400">*</span>
          </label>
          <Input
            theme="dark"
            placeholder="Enter email address"
            value={emailAddresses}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onRecipientBlur}
            aria-invalid={!!recipientError}
            className="h-9 text-[12px]"
          />
          <p className="mt-1.5 text-[10.5px] text-slate-500">
            Separate multiple emails with commas
          </p>
          {recipientError && (
            <p className="mt-1 text-[10.5px] text-red-400">{recipientError}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
            Sales Rep <span className="text-red-400">*</span>
          </label>
          <Select
            value={salesRepId || undefined}
            onValueChange={onSalesRepChange}
            onOpenChange={(open) => {
              if (!open) onRecipientBlur();
            }}
          >
            <SelectTrigger
              theme="dark"
              className="h-9 w-full text-[12px]"
              aria-invalid={!!recipientError}
            >
              <SelectValue placeholder="Select a sales rep" />
            </SelectTrigger>
            <SelectContent theme="dark">
              {salesReps.map((rep) => (
                <SelectItem key={rep.id} value={rep.id} className="text-[12px]">
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-[10.5px] text-slate-500">
            The selected sales rep will be notified and can access the document.
          </p>
          {recipientError && (
            <p className="mt-1 text-[10.5px] text-red-400">{recipientError}</p>
          )}
        </div>
      )}

      {recipientType === "email" && (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-medium tracking-wider text-slate-600">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="opacity-60">
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
              Sales Rep
            </label>
            <Select disabled>
              <SelectTrigger theme="dark" className="h-9 w-full text-[12px]">
                <SelectValue placeholder="Select a sales rep" />
              </SelectTrigger>
            </Select>
            <p className="mt-1.5 text-[10.5px] text-slate-500">
              Switch to Sales Rep above to send to a team member.
            </p>
          </div>
        </>
      )}
    </SendDocumentSectionCard>
  );
}

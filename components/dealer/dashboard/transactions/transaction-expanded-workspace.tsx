"use client";

import { useEffect, useState } from "react";
import { CheckCircle, FileText, Loader2, Upload } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormGrid,
  FormSection,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import {
  resetTransactionForm,
  useTransactionWorkspaceForm,
} from "@/hooks/dealer/use-transaction-workspace-form";
import type { DealerTransaction } from "@/lib/dealer/dashboard/types";
import TransactionAuditTimeline from "./transaction-audit-timeline";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

function DarkFileUpload({
  onUpload,
  uploaded,
}: {
  onUpload: () => void;
  uploaded: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onUpload}
      onKeyDown={(e) => e.key === "Enter" && onUpload()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onUpload();
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 transition-colors",
        dragOver
          ? "border-emerald-400 bg-emerald-500/10"
          : "border-[#1e293b] bg-[#070c14]/40 hover:border-slate-600",
        uploaded && "border-emerald-500/50",
      )}
    >
      {uploaded ? (
        <>
          <CheckCircle className="mb-2 h-8 w-8 text-emerald-400" />
          <p className="text-[12px] font-medium text-emerald-400">
            Document attached successfully
          </p>
        </>
      ) : (
        <>
          <Upload className="mb-2 h-7 w-7 text-slate-500" />
          <p className="text-[12px] font-medium text-slate-300">
            Drag and drop or click to upload
          </p>
          <p className="mt-1 text-[10px] text-[#64748b]">
            PDF, JPG, PNG up to 10MB
          </p>
        </>
      )}
    </div>
  );
}

export default function TransactionExpandedWorkspace({
  transaction,
  onClose,
}: {
  transaction: DealerTransaction | null;
  onClose: () => void;
}) {
  const { workspaceSaving, simulateSave } = useDealerDashboard();
  const form = useTransactionWorkspaceForm(transaction);
  const [docUploaded, setDocUploaded] = useState(
    (transaction?.documents.length ?? 0) > 0,
  );

  useEffect(() => {
    resetTransactionForm(form, transaction);
    setDocUploaded((transaction?.documents.length ?? 0) > 0);
  }, [transaction, form]);

  const onSubmit = form.handleSubmit(async () => {
    await simulateSave();
    onClose();
  });

  const handleUpload = async () => {
    await simulateSave();
    setDocUploaded(true);
  };

  if (workspaceSaving) {
    return (
      <div className="mt-3 rounded-md border border-[#1e293b] bg-[#0a101d]/80 p-4">
        <SkeletonBar className="mb-3 h-4 w-56" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBar key={i} className="h-8" />
          ))}
        </div>
        <SkeletonBar className="mt-3 h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-amber-500/30 bg-[#0a101d]/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-bold tracking-tight text-white">
          {transaction ? "Edit Transaction" : "New Transaction"} - Core Engine
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-slate-500 hover:text-white"
        >
          Collapse
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormSection theme="dark" title="Transaction Details">
            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="buyerDealerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] text-[#64748b]">
                      Buyer Dealer Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        theme="dark"
                        {...field}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] text-[#64748b]">
                      Sale Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        theme="dark"
                        mode="currency"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] text-[#64748b]">
                      Payment Status
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 border-[#1e293b] bg-[#070c14]/60 text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-[#1e293b] bg-[#0a101d]">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="settled">Settled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <div>
            <div className="mb-2 text-[10px] font-bold tracking-wide text-[#64748b]">
              DOCUMENT PIPELINE
            </div>
            <DarkFileUpload onUpload={handleUpload} uploaded={docUploaded} />
            {transaction?.documents.map((doc) => (
              <div
                key={doc.id}
                className="mt-2 flex items-center gap-2 rounded border border-[#1e293b] bg-[#070c14]/40 px-2 py-1.5"
              >
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-[11px] text-slate-300">{doc.name}</span>
                <CheckCircle className="ml-auto h-4 w-4 text-emerald-400" />
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] text-[#64748b]">
                  Transaction Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    className="border-[#1e293b] bg-[#070c14]/60 text-[12px] text-slate-100"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {transaction && (
            <TransactionAuditTimeline events={transaction.auditEvents} />
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-8 border-[#1e293b] bg-transparent text-[12px] text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={workspaceSaving}
              className="h-8 bg-amber-600 text-[12px] hover:bg-amber-500"
            >
              {workspaceSaving && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Save Transaction
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

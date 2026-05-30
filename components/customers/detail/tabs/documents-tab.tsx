"use client";

import { useRef, useTransition } from "react";
import { ExternalLink, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadCustomerDocument } from "@/lib/customers/server/upload-customer-document";
import { formatDisplayDate, type CustomerDetail } from "@/lib/customers/types";

export default function ProfileDocumentsTab({
  customer,
  onRefresh,
}: {
  customer: CustomerDetail;
  onRefresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const handleUpload = (file: File) => {
    startTransition(async () => {
      const result = await uploadCustomerDocument(customer.id, file);
      if (result.success) {
        toast.success("Document uploaded");
        onRefresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="flex h-[130px] w-[130px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-600 text-slate-500 transition hover:border-slate-500 hover:text-slate-400"
        >
          {pending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Plus className="h-6 w-6" />
              <span className="text-[11px] font-medium">Upload</span>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {customer.documents.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-slate-500">
          No documents on file for this customer.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {customer.documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-md border border-slate-700/80 bg-[#0b121f]/50 p-4 transition hover:border-slate-600"
            >
              <div className="grid h-11 w-11 place-items-center rounded-md bg-red-500/15">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <span className="line-clamp-2 text-center text-[11px] font-medium text-white">
                {doc.label}
              </span>
              <span className="text-[10px] text-slate-500">
                {formatDisplayDate(doc.createdAt)}
              </span>
              <ExternalLink className="h-3 w-3 text-slate-600" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

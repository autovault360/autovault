"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ModalBody,
  ModalHeader,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";
import { toast } from "sonner";
import { replaceWholesaleDocumentFile } from "@/lib/dealer/documents/server/document-actions";
import { validateUploadedFile } from "@/lib/dealer/documents/schemas";
import type { WholesaleDocument } from "@/lib/dealer/documents/types";

export default function ReplaceFileModal({
  open,
  onOpenChange,
  document,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: WholesaleDocument | null;
  onSuccess: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!document || !file) {
      toast.error("Please select a file.");
      return;
    }

    const error = validateUploadedFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await replaceWholesaleDocumentFile(document.id, fd);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("File replaced successfully.");
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} theme="dark" size="md">
      <ModalHeader
        icon={<Upload className="h-4 w-4 text-white" />}
        iconClassName="bg-blue-600"
        title="Replace File"
        subtitle={document ? `Replace file for "${document.documentName}"` : ""}
        onClose={() => onOpenChange(false)}
      />
      <ModalBody className="space-y-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-700 px-4 py-8 hover:border-slate-600"
        >
          <Upload className="mb-2 h-8 w-8 text-slate-500" />
          <p className="text-[12px] text-slate-300">
            {file ? file.name : "Click to choose a new file"}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">PDF, JPG, PNG, DOCX, XLSX - max 25 MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </ModalBody>
      <div className="flex justify-end gap-2 border-t border-slate-700/80 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="border-slate-600 bg-transparent text-slate-300"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={submitting || !file}
          className="bg-emerald-600 hover:bg-emerald-500"
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Replace File"
          )}
        </Button>
      </div>
    </VehicleActionDialog>
  );
}

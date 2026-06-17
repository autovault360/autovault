"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CloudUpload,
  Loader2,
  X,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/shared/modal-primitives";
import { cn } from "@/lib/utils";
import { useWholesaleDocumentForm } from "@/hooks/dealer/use-wholesale-document-form";
import {
  WHOLESALE_DOCUMENT_CATEGORIES,
  WHOLESALE_DOCUMENT_CATEGORY_LABELS,
  WHOLESALE_DOCUMENT_TYPES,
  WHOLESALE_DOCUMENT_TYPE_LABELS,
} from "@/lib/dealer/documents/constants";
import DocumentVehicleLookup from "./document-vehicle-lookup";

const STEPS = [
  { id: 1, label: "Upload Details" },
  { id: 2, label: "File Upload" },
  { id: 3, label: "Review & Save" },
] as const;

function FileDropZone({
  file,
  onFileSelect,
}: {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <div>
      <FieldLabel label="Upload File" required />
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-colors",
          dragOver
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-slate-700/80 bg-[#070c14]/50 hover:border-slate-600",
          file && "border-emerald-500/40 bg-emerald-500/5",
        )}
      >
        {file ? (
          <>
            <CheckCircle className="mb-2 h-8 w-8 text-emerald-400" />
            <p className="max-w-full truncate px-2 text-center text-[12px] font-medium text-emerald-400">
              {file.name}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <CloudUpload className="mb-2 h-10 w-10 text-emerald-500" />
            <p className="text-center text-[12px] text-slate-400">
              Drag and drop your file here or
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-8 border-slate-600 bg-[#0a101c] text-[11px] text-slate-200 hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </Button>
          </>
        )}
        <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-500">
          Supported: PDF, JPG, PNG, DOCX, XLSX (Max 25MB)
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function UploadDocumentWorkspace({
  open,
  onClose,
  onSuccess,
  variant = "sidebar",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  variant?: "sidebar" | "sheet";
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    } else {
      setMounted(false);
    }
  }, [open]);

  const {
    form,
    step,
    setStep,
    file,
    setFile,
    linkedVehicle,
    setLinkedVehicle,
    shake,
    isSubmitting,
    resetForm,
    goBack,
    submitCreate,
    validateStep,
  } = useWholesaleDocumentForm({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const documentType = form.watch("documentType");
  const values = form.watch();

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = async () => {
    const valid = await validateStep(step);
    if (!valid) return;

    if (step === 1) {
      if (file) {
        setStep(3);
      } else {
        setStep(2);
      }
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
  };

  if (!open) return null;

  if (!mounted) {
    return (
      <aside
        className={cn(
          "flex min-h-0 w-full flex-col border-slate-700/80 bg-card",
          variant === "sidebar" &&
            "sticky top-3 max-h-[calc(100vh-5.5rem)] rounded-md border shadow-lg shadow-black/20",
          variant === "sheet" && "max-h-[92vh] rounded-t-xl border-t",
        )}
      >
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-5 w-32 rounded bg-slate-800" />
          <div className="h-3 w-48 rounded bg-slate-800/70" />
          <div className="mt-4 flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-1 items-center gap-1.5">
                <div className="h-7 w-7 rounded-full bg-slate-800" />
                <div className="h-3 w-16 rounded bg-slate-800/70" />
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-9 rounded bg-slate-800/60" />
            <div className="h-9 rounded bg-slate-800/60" />
            <div className="h-9 rounded bg-slate-800/60" />
            <div className="h-20 rounded bg-slate-800/60" />
            <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-slate-800">
              <div className="h-10 w-10 rounded-full bg-slate-800" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-9 flex-1 rounded bg-slate-800/60" />
            <div className="h-9 flex-1 rounded bg-slate-800/60" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full flex-col border-slate-700/80 bg-card",
        variant === "sidebar" &&
          "sticky top-3 max-h-[calc(100vh-5.5rem)] rounded-md border shadow-lg shadow-black/20",
        variant === "sheet" && "max-h-[92vh] rounded-t-xl border-t",
        shake && "animate-shake motion-reduce:animate-none",
      )}
    >
      <div className="shrink-0 border-b border-slate-800/80 px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-bold text-white">Upload Document</h2>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Attach any document to a vehicle.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close upload panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  step >= s.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-500",
                )}
              >
                {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={cn(
                  "hidden truncate text-[10px] font-medium lg:inline",
                  step >= s.id ? "text-emerald-400" : "text-slate-500",
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-0.5 h-px min-w-[12px] flex-1",
                    step > s.id ? "bg-emerald-600/50" : "bg-slate-800",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 3) submitCreate();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {(step === 1 || step === 2) && (
              <div className="space-y-4">
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FieldLabel label="Document Type" required />
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                theme="dark"
                              >
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent theme="dark">
                              {WHOLESALE_DOCUMENT_TYPES.map((t) => (
                                <SelectItem key={t} value={t} className="text-[12px]">
                                  {WHOLESALE_DOCUMENT_TYPE_LABELS[t]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {documentType === "vehicle_document" && (
                      <DocumentVehicleLookup
                        vehicle={linkedVehicle}
                        onVehicleChange={setLinkedVehicle}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FieldLabel label="Document Category" required />
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                theme="dark"
                              >
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent theme="dark">
                              {WHOLESALE_DOCUMENT_CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-[12px]">
                                  {WHOLESALE_DOCUMENT_CATEGORY_LABELS[c]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="documentName"
                      render={({ field }) => (
                        <FormItem>
                          <FieldLabel label="Document Name" required />
                          <FormControl>
                            <Input
                              theme="dark"
                              {...field}
                              placeholder="Enter document name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FieldLabel label="Notes (Optional)" />
                          <FormControl>
                            <Textarea
                              theme="dark"
                              {...field}
                              rows={3}
                              maxLength={250}
                              className="resize-none"
                            />
                          </FormControl>
                          <p className="text-right text-[10px] text-slate-500">
                            {(field.value?.length ?? 0)}/250
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FileDropZone file={file} onFileSelect={setFile} />
                  </>
                )}

                {step === 2 && <FileDropZone file={file} onFileSelect={setFile} />}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 rounded-md border border-slate-700/80 bg-[#070c14]/50 p-3.5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Review & Save
                </h3>
                <dl className="space-y-2.5 text-[11.5px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Type</dt>
                    <dd className="text-right text-white">
                      {WHOLESALE_DOCUMENT_TYPE_LABELS[values.documentType]}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Category</dt>
                    <dd className="text-right text-white">
                      {WHOLESALE_DOCUMENT_CATEGORY_LABELS[values.category]}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Name</dt>
                    <dd className="truncate text-right text-white">{values.documentName}</dd>
                  </div>
                  {linkedVehicle && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Vehicle</dt>
                      <dd className="text-right text-emerald-400">{linkedVehicle.vin}</dd>
                    </div>
                  )}
                  {file && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">File</dt>
                      <dd className="truncate text-right text-white">{file.name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <div className="shrink-0 flex gap-2 border-t border-slate-800/80 px-4 py-3.5">
            {step === 1 ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-slate-800"
                onClick={handleClose}
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-slate-800"
                onClick={() => {
                  if (step === 3 && file) setStep(1);
                  else goBack();
                }}
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                className="h-9 flex-1 bg-emerald-600 text-[12px] hover:bg-emerald-500"
                onClick={handleNext}
              >
                {step === 1 ? "Next: Upload File" : "Next: Review & Save"}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 flex-1 bg-emerald-600 text-[12px] hover:bg-emerald-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Document"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </aside>
  );
}

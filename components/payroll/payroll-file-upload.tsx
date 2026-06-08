"use client";

import { useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export default function PayrollFileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateAndSet = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File must be under 20 MB");
      return;
    }
    setSelectedFile(file);
    toast.success("Payroll file uploaded");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    toast.info("File removed");
  };

  return (
    <CardShell>
      <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        PAYROLL TYPE UPLOAD
      </div>
      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#070c14]/30 px-4 py-8 transition hover:border-blue-500/40 hover:bg-[#070c14]/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
      >
        <CloudUpload className="mb-2 h-8 w-8 text-slate-500" />
        <p className="text-center text-[12px] text-slate-400">
          Drag &amp; Drop Payroll File Here
        </p>
        <p className="mt-1 text-center text-[10.5px] text-slate-500">
          or{" "}
          <span className="font-medium text-blue-400">Choose File</span>
        </p>
        <p className="mt-2 text-center text-[10px] text-slate-600">
          PDF only • Max 20 MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {selectedFile && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-slate-800 bg-[#0e1626] px-3 py-2">
          <span className="truncate text-[11px] text-slate-300">
            {selectedFile.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="shrink-0 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </CardShell>
  );
}

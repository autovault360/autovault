"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { Button } from "@/components/ui/button";
import { logPayrollAudit } from "@/lib/payroll/audit";

const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = [".pdf", ".jpg", ".jpeg", ".png"];
const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png"];

type UploadedFile = { id: string; name: string; uploadedAt: string };

export default function EmployeePaymentUpload({
  employeeId,
}: {
  employeeId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const validateAndAdd = (file: File) => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED.includes(ext) && !ACCEPTED_MIME.includes(file.type)) {
      toast.error("Only PDF, JPEG, or PNG files are supported");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File must be under 20 MB");
      return;
    }
    const entry: UploadedFile = {
      id: `upload-${Date.now()}`,
      name: file.name,
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setFiles((prev) => [...prev, entry]);
    logPayrollAudit({ entity: "employee_payroll", employeeId, action: "upload_document", timestamp: new Date().toISOString(), metadata: { fileName: file.name } });
    toast.success("Payment document uploaded");
  };

  return (
    <DetailCard className="mb-2 bg-[#070c14]/60 border-slate-800/80 h-auto">
      <DetailCardHead title="UPLOAD PAYMENT TYPE" />
      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#050708]/40 px-3 py-3 transition hover:border-blue-500/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) validateAndAdd(f); }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
      >
        <CloudUpload className="mb-2 h-6 w-6 text-slate-500" />
        <p className="text-center text-[11px] text-slate-400">Upload Check Image / Document</p>
        <Button type="button" size="sm" className="mt-2 h-7 bg-blue-600 text-[10px] hover:bg-blue-500" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Choose File
        </Button>
        <p className="mt-2 text-[9px] text-slate-600">PDF, JPEG, PNG · Max 20 MB</p>
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndAdd(f); e.target.value = ""; }} />
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded border border-slate-800 bg-[#0e1626] px-2 py-1.5">
              <span className="flex items-center gap-1.5 truncate text-[13px] text-slate-300">
                <FileText className="h-3.5 w-3.5 shrink-0 text-red-400" />
                {f.name}
              </span>
              <button type="button" className="text-slate-500 hover:text-white" onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}>
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </DetailCard>
  );
}

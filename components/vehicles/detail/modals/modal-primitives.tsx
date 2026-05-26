"use client";

import * as React from "react";
import Image from "next/image";
import {
  Camera,
  FileText,
  Info,
  InfoIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormGrid } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  formatFileSize,
  isImageFile,
  isPdfFile,
  validateFile,
} from "@/lib/vehicles/actions/utils";
import { formatField, formatMileage, getStatusStyle } from "@/lib/vehicles/types";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import {
  getFooterBorderClass,
  getHeaderBorderClass,
  getInputReadonlyClass,
  getLabelClass,
  getModalShellClass,
  getTextareaClass,
  type ModalTheme,
} from "./modal-theme";
import { ModalThemeProvider, useModalTheme } from "./modal-theme-context";


export function VehicleActionDialog({
  open,
  onOpenChange,
  size = "lg",
  theme = "light",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "xl" | "lg" | "md";
  theme?: ModalTheme;
  children: React.ReactNode;
}) {
  const widthClass = {
    xl: "w-[min(1100px,calc(100vw-2rem))] sm:max-w-[1100px]",
    lg: "w-[min(920px,calc(100vw-2rem))] sm:max-w-[920px]",
    md: "w-[min(860px,calc(100vw-2rem))] sm:max-w-[860px]",
  }[size];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden border-0 p-0 shadow-xl ring-0",
          "max-w-none sm:max-w-none",
          widthClass,
          getModalShellClass(theme),
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          "motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none",
        )}
      >
        <DialogTitle className="sr-only">Vehicle action</DialogTitle>
        <ModalThemeProvider theme={theme}>
          <div className="max-h-[90vh] overflow-y-auto">{children}</div>
        </ModalThemeProvider>
      </DialogContent>
    </Dialog>
  );
}

export function ModalHeader({
  icon,
  iconClassName,
  title,
  subtitle,
  titleExtra,
  onClose,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  subtitle: string;
  titleExtra?: React.ReactNode;
  onClose: () => void;
}) {
  const theme = useModalTheme();
  return (
    <div
      className={cn(
        "flex items-start justify-between border-b px-6 pb-4 pt-6",
        getHeaderBorderClass(theme),
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "text-[17px] font-bold",
                theme === "dark" ? "text-slate-100" : "text-gray-900",
              )}
            >
              {title}
            </h2>
            {titleExtra}
          </div>
          <p
            className={cn(
              "mt-0.5 text-[12.5px]",
              theme === "dark" ? "text-slate-400" : "text-gray-500",
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "rounded-md p-1 transition",
          theme === "dark"
            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ModalBody({
  children,
  className,
  shake = false,
}: {
  children: React.ReactNode;
  className?: string;
  shake?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-5 px-6 py-5",
        shake && "animate-shake motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold tracking-[0.12em] text-[#2563eb] uppercase">
      {children}
    </h3>
  );
}


export function FieldLabel({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children?: React.ReactNode;
}) {
  const theme = useModalTheme();
  return (
    <div className="flex items-center gap-1">
      <label htmlFor={htmlFor} className={getLabelClass(theme)}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const theme = useModalTheme();
  return (
    <div>
      <FieldLabel label={label} />
      <div
        className={cn(
          "mt-1.5 flex h-8 items-center rounded-[4px] border px-3 text-[13px]",
          getInputReadonlyClass(theme),
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Needs Attention": "bg-amber-100 text-amber-700 border-amber-200",
    "Marked Sold": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2.5 py-0.5 text-[11px] font-semibold",
        styles[status] ?? getStatusStyle(status as never),
      )}
    >
      {status}
    </span>
  );
}

export function VehicleSummaryBlock({
  vehicle,
  photoPreview,
  onPhotoChange,
}: {
  vehicle: VehicleDetail;
  photoPreview: string | null;
  onPhotoChange: (file: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayPhoto = photoPreview ?? vehicle.images[0] ?? vehicle.image;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 md:grid-cols-[1fr_auto]">
      <FormGrid cols={4}>
        <ReadOnlyField label="Stock Number" value={vehicle.stockNumber} />
        <ReadOnlyField label="VIN" value={vehicle.vin} />
        <ReadOnlyField
          label="Mileage"
          value={`${formatMileage(vehicle.mileage)} mi`}
        />
        <ReadOnlyField label="Location" value={formatField("location", vehicle.location)} />
        <div>
          <FieldLabel label="Status" />
          <div className="flex h-10 items-center">
            <StatusBadge status={vehicle.status} />
          </div>
        </div>
      </FormGrid>
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-[200px] h-[150px] overflow-hidden rounded-md border border-gray-200 bg-white">
          {displayPhoto && (
            <Image
              src={displayPhoto}
              alt={vehicle.displayTitle}
              fill
              className="object-cover"
              unoptimized={displayPhoto.startsWith("blob:")}
            />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhotoChange(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full h-8 border-gray-200 bg-white text-[11px] text-gray-700 hover:bg-gray-50"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-1.5 h-3.5 w-3.5" />
          Change Photo
        </Button>
      </div>
    </div>
  );
}

export function TextareaWithCount({
  value,
  onChange,
  maxLength,
  placeholder,
  id,
  rows = 4,
  "aria-invalid": ariaInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  id?: string;
  rows?: number;
  "aria-invalid"?: boolean;
}) {
  const theme = useModalTheme();
  const atLimit = value.length >= maxLength;
  return (
    <div className="relative">
      <Textarea
        id={id}
        aria-invalid={ariaInvalid}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={getTextareaClass(theme)}
      />
      <span
        className={cn(
          "absolute right-2 bottom-2 text-[10px]",
          atLimit ? "text-red-500" : theme === "dark" ? "text-slate-500" : "text-gray-400",
        )}
      >
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

export function MarketStatCard({
  label,
  value,
  badge = "Good",
  valueClassName,
}: {
  label: string;
  value: string;
  badge?: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <p className="text-[10.5px] text-gray-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className={cn("text-[15px] font-bold text-gray-900", valueClassName)}>
          {value}
        </p>
        <span className="text-[10px] font-semibold text-emerald-600">
          {badge}
        </span>
      </div>
    </div>
  );
}

export function CompareToMarket({
  text,
  isBelowMarket,
}: {
  text: string;
  isBelowMarket: boolean;
}) {
  return (
    <div>
      <FieldLabel label="Compare to Market">
        <Info className="h-3 w-3 text-gray-400" />
      </FieldLabel>
      <div className="flex h-10 items-center">
        <span
          className={cn(
            "text-[13px] font-medium",
            isBelowMarket ? "text-emerald-600" : "text-gray-700",
          )}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

export function InternalRepairRadio({
  value,
  onChange,
}: {
  value: "yes" | "no";
  onChange: (value: "yes" | "no") => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 justify-between mb-1.5">
        <FieldLabel label="Is this an Internal Repair?">
          <Info className="h-3 w-3 text-blue-500" />
        </FieldLabel>
      </div>
      <RadioGroup
        value={value}
        onValueChange={(v: string) => onChange(v as "yes" | "no")}
        className="mt-1 flex flex-col gap-2 sm:flex-row sm:gap-6"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id="internal-yes" />
          <Label htmlFor="internal-yes" className="text-[12px] text-gray-700">
            Yes (In-house)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id="internal-no" />
          <Label htmlFor="internal-no" className="text-[12px] text-gray-700">
            No (External Shop)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

export function FileUploadZone({
  onFilesAdded,
  accept,
  maxSizeMB,
  allowedTypes,
  hint,
}: {
  onFilesAdded: (files: File[]) => void;
  accept: string;
  maxSizeMB: number;
  allowedTypes: string[];
  hint: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const valid: File[] = [];
    for (const file of Array.from(fileList)) {
      const err = validateFile(file, { maxSizeMB, allowedTypes });
      if (err) {
        setError(err);
        return;
      }
      valid.push(file);
    }
    setError(null);
    onFilesAdded(valid);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-colors duration-150",
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50/50 hover:border-gray-300",
        )}
      >
        <Camera className="mb-2 h-8 w-8 text-gray-400" />
        <p className="text-[13px] font-medium text-gray-700">
          Drag and drop files here or click to browse
        </p>
        <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />
      {error && (
        <p className="mt-1 animate-in fade-in text-[11px] text-red-500 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

export function FilePreviewCard({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isImageFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [file]);

  return (
    <div className="animate-in fade-in zoom-in-95 flex items-center gap-3 rounded-md border border-gray-200 bg-white p-2.5 duration-200 motion-reduce:animate-none">
      {isPdfFile(file) ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-50">
          <FileText className="h-5 w-5 text-red-500" />
        </div>
      ) : previewUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
          <Image src={previewUrl} alt={file.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
          <FileText className="h-5 w-5 text-gray-500" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-gray-800">{file.name}</p>
        <p className="text-[10px] text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ImageUploadSlot({
  label,
  required,
  file,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  file: File | null | undefined;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file && isImageFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed transition-colors duration-150",
          error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-blue-50/30 hover:border-blue-300",
          previewUrl && "border-solid border-gray-200",
        )}
      >
        {previewUrl ? (
          <>
            <Image src={previewUrl} alt={label} fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <>
            <Upload className="mb-1.5 h-5 w-5 text-blue-400" />
            <span className="text-[10px] font-medium text-blue-500">Upload JPG</span>
            <span className="text-[9px] text-gray-400">Max 5MB</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const err = validateFile(f, {
              maxSizeMB: 5,
              allowedTypes: ["image/jpeg"],
            });
            if (!err) onChange(f);
          }
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-1 animate-in fade-in text-[11px] text-red-500 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-[#e5edf6] px-4 py-3">
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <p className="text-[12px] leading-relaxed">{children}</p>
    </div>
  );
}

export function ModalFooter({
  onCancel,
  onSubmit,
  submitLabel,
  submitClassName,
  isSubmitting,
  disabled,
  leftSlot,
  submitIcon,
  className
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitClassName: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  leftSlot?: React.ReactNode;
  submitIcon?: React.ReactNode;
  className?: string;
}) {
  const theme = useModalTheme();
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:items-center",
        leftSlot ? "sm:justify-between" : "sm:justify-end",
        getFooterBorderClass(theme),
        className,
      )}
    >
      {leftSlot && <div className="sm:mr-auto">{leftSlot}</div>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            "h-10 px-5 text-[13px]",
            theme === "dark"
              ? "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
          )}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isSubmitting}
          className={cn("h-10 px-5 text-[13px] font-semibold text-white", submitClassName)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              {submitIcon}
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function AutoCalculatedCaption() {
  return (
    <p className="text-[10px] text-blue-500">Auto-calculated</p>
  );
}

export function MarketDataFooter({ date }: { date: string }) {
  const display =
    date.includes("-") && date.length === 10 ? formatDisplayDate(date) : date;
  return (
    <p className="flex items-center gap-1 text-[10.5px] text-gray-400">
      <Info className="h-3 w-3" />
      Data updated on {display}
    </p>
  );
}

export function HelperText({ children }: { children: React.ReactNode }) {
  const theme = useModalTheme();
  return (
    <p
      className={cn(
        "mt-0.5 text-[10px]",
        theme === "dark" ? "text-slate-500" : "text-gray-500",
      )}
    >
      {children}
    </p>
  );
}

export function UploadSectionHint({
  left,
  right,
}: {
  left: string;
  right?: string;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] text-gray-500">{left}</p>
      {right && <p className="text-[10px] text-gray-400">{right}</p>}
    </div>
  );
}

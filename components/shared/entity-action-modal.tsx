"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectOptions,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type EntityActionField =
  | {
      name: string;
      label: string;
      type: "input";
      placeholder?: string;
      required?: boolean;
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      required?: boolean;
      options: { value: string; label: string }[];
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      type: "radio";
      required?: boolean;
      options: { value: string; label: string }[];
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      required?: boolean;
      defaultValue?: string;
      rows?: number;
    };

export type EntityActionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  sectionTitle?: string;
  icon?: React.ReactNode;
  fields: EntityActionField[];
  onSave: (values: Record<string, string>) => Promise<void> | void;
  saveLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  width?: "sm" | "md" | "lg";
};

const widthClassMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

export default function EntityActionModal({
  open,
  onOpenChange,
  title,
  subtitle,
  sectionTitle,
  icon,
  fields,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting: externalSubmitting,
  width = "md",
}: EntityActionModalProps) {
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const isSubmitting = externalSubmitting ?? internalSubmitting;

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      for (const f of fields) {
        initial[f.name] = f.defaultValue ?? "";
      }
      setValues(initial);
    }
  }, [open, fields]);

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSave = async () => {
    setInternalSubmitting(true);
    try {
      await onSave(values);
    } finally {
      setInternalSubmitting(false);
    }
  };

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden border-slate-700 bg-slate-900 p-0 shadow-xl",
          widthClassMap[width],
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-700 px-5 pb-3 pt-5">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {sectionTitle && (
            <h3 className="text-[11px] font-bold tracking-[0.12em] text-blue-500 uppercase">
              {sectionTitle}
            </h3>
          )}

          {fields.map((field) => (
            <div key={field.name}>
              {field.type === "radio" ? (
                <fieldset>
                  <legend className="mb-2 text-xs font-medium text-slate-300">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-500">*</span>}
                  </legend>
                  <RadioGroup
                    value={values[field.name]}
                    onValueChange={(v) => setValue(field.name, v)}
                    disabled={isSubmitting}
                    className="flex flex-wrap gap-4"
                  >
                    {field.options.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={opt.value}
                          id={`${field.name}-${opt.value}`}
                        />
                        <Label
                          htmlFor={`${field.name}-${opt.value}`}
                          className="text-xs text-slate-300"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </fieldset>
              ) : field.type === "select" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-500">*</span>}
                  </Label>
                  <Select
                    value={values[field.name] || undefined}
                    onValueChange={(v) => setValue(field.name, v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger theme="dark">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent theme="dark">
                      <SelectOptions
                        options={field.options}
                        theme="dark"
                      />
                    </SelectContent>
                  </Select>
                </div>
              ) : field.type === "textarea" ? (
                <div className="space-y-1.5">
                  <Label
                    htmlFor={field.name}
                    className="text-xs font-medium text-slate-300"
                  >
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-500">*</span>}
                  </Label>
                  <Textarea
                    id={field.name}
                    value={values[field.name]}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isSubmitting}
                    rows={field.rows ?? 3}
                    theme="dark"
                    className="resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label
                    htmlFor={field.name}
                    className="text-xs font-medium text-slate-300"
                  >
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-500">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    value={values[field.name]}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isSubmitting}
                    theme="dark"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-end gap-2 border-t border-slate-700 px-5 pb-4 pt-3">
          <Button
            type="button"
            variant="outline"
            theme="dark"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            theme="dark"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              saveLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

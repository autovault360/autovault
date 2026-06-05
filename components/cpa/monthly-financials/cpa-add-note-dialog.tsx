"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import {
  createCpaMonthlyNoteSchema,
  type CreateCpaMonthlyNoteInput,
} from "@/lib/cpa/actions/schemas";
import { cn } from "@/lib/utils";

const RIBBON_OPTIONS = [
  { value: "blue", label: "Blue - Documents / Receipts" },
  { value: "green", label: "Green - Tax / Filing" },
  { value: "amber", label: "Amber - Payroll / Urgent" },
] as const;

const RIBBON_TO_API: Record<
  CreateCpaMonthlyNoteInput["ribbon"],
  { category: string; priority: string }
> = {
  blue: { category: "Documents", priority: "MEDIUM" },
  green: { category: "Sales Tax", priority: "LOW" },
  amber: { category: "Payroll", priority: "HIGH" },
};

export default function CpaAddNoteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateCpaMonthlyNoteInput>({
    resolver: zodResolver(createCpaMonthlyNoteSchema),
    defaultValues: { content: "", ribbon: undefined },
    mode: "onChange",
  });

  const onSubmit = async (values: CreateCpaMonthlyNoteInput) => {
    setSubmitting(true);
    try {
      const mapped = RIBBON_TO_API[values.ribbon];
      const res = await fetch("/api/cpa/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.content,
          description: "",
          category: mapped.category,
          priority: mapped.priority,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create note");
      }
      toast.success("CPA note added successfully");
      form.reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-[#0b1329] text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add CPA Note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Note Title / Content</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter note (5-250 characters)"
                      className="border-slate-700 bg-[#0b1329] text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ribbon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Category Ribbon Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        theme="dark"
                        className={cn(
                          "w-full border-slate-700 bg-[#0b1329] text-white",
                          form.formState.errors.ribbon && "border-red-500",
                        )}
                      >
                        <SelectValue placeholder="Select ribbon color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-slate-700 bg-[#0b1329] text-slate-200">
                      {RIBBON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Note"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

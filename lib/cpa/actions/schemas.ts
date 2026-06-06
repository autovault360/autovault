import { z } from "zod";

const noteCategory = z.enum([
  "Documents",
  "Receipts",
  "Payroll",
  "Sales Tax",
  "Deal Jackets",
  "Audit",
  "Vehicle Records",
  "General",
]);

const notePriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const noteStatus = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "ARCHIVED"]);

export const createCpaNoteSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(10000).optional().default(""),
  category: noteCategory.default("General"),
  priority: notePriority.default("MEDIUM"),
  stockNumber: z.string().max(100).optional().nullable(),
});

export const updateCpaNoteSchema = z.object({
  status: noteStatus.optional(),
  priority: notePriority.optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  isArchived: z.boolean().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(10000).optional(),
});

export const createCpaCommentSchema = z.object({
  comment: z.string().min(1).max(5000),
});

export const cpaNotesQuerySchema = z.object({
  status: z.enum(["all", "OPEN", "IN_PROGRESS", "RESOLVED", "ARCHIVED"]).optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest", "priority", "status"]).optional(),
});

export type CreateCpaNoteInput = z.infer<typeof createCpaNoteSchema>;
export type UpdateCpaNoteInput = z.infer<typeof updateCpaNoteSchema>;
export type CreateCpaCommentInput = z.infer<typeof createCpaCommentSchema>;

export const createCpaMonthlyNoteSchema = z.object({
  content: z
    .string()
    .min(5, "Note must be at least 5 characters")
    .max(250, "Note cannot exceed 250 characters"),
  ribbon: z.enum(["blue", "green", "amber"], {
    message: "Please select a category ribbon",
  }),
});

export type CreateCpaMonthlyNoteInput = z.infer<typeof createCpaMonthlyNoteSchema>;

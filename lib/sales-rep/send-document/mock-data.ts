import type { SalesRepOption, SendDocumentFile } from "./types";

export const SALES_REP_OPTIONS: SalesRepOption[] = [
  { id: "sr-1", name: "Mike Johnson", email: "mike.johnson@dealership.com" },
  { id: "sr-2", name: "Sarah Chen", email: "sarah.chen@dealership.com" },
  { id: "sr-3", name: "James Wilson", email: "james.wilson@dealership.com" },
  { id: "sr-4", name: "Emily Rodriguez", email: "emily.r@dealership.com" },
];

/** Demo files matching the design mockup. */
export const DEMO_SELECTED_DOCUMENTS: SendDocumentFile[] = [
  {
    id: "doc-1",
    name: "Bill of Sale.pdf",
    size: 245 * 1024,
    type: "application/pdf",
  },
  {
    id: "doc-2",
    name: "Title Copy.pdf",
    size: 189 * 1024,
    type: "application/pdf",
  },
  {
    id: "doc-3",
    name: "Odometer Statement.pdf",
    size: 156 * 1024,
    type: "application/pdf",
  },
];

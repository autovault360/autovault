import { Suspense } from "react";
import type { Metadata } from "next";
import DocumentsPageContent from "@/components/dealer/documents/documents-page-content";
import DocumentsLoading from "./loading";
import { getWholesaleDocumentsDashboard } from "@/lib/dealer/documents/server/get-wholesale-documents-dashboard";

export const metadata: Metadata = {
  title: "Documents | Wholesale Dealer Dashboard",
  description: "Manage bills of sale, titles, auction invoices, and dealer documents.",
};

export default async function DealerDocumentsPage() {
  const data = await getWholesaleDocumentsDashboard();

  return (
    <Suspense fallback={<DocumentsLoading />}>
      <DocumentsPageContent {...data} />
    </Suspense>
  );
}

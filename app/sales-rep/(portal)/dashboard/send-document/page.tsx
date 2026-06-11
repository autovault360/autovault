import type { Metadata } from "next";
import SalesRepSendDocumentContent from "@/components/sales-rep/send-document/sales-rep-send-document-content";

export const metadata: Metadata = {
  title: "Send Document | Sales Rep Dashboard",
  description:
    "Send documents securely to buyers, auctions, or team members.",
};

export default function SendDocumentPage() {
  return <SalesRepSendDocumentContent />;
}

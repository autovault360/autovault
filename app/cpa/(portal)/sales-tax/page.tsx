import type { Metadata } from "next";
import CpaSalesTaxContent from "@/components/cpa/sales-tax/cpa-sales-tax-content";

export const metadata: Metadata = {
  title: "Sales Tax by Vehicle | CPA Portal",
  description:
    "Sales tax collected and remitted by vehicle for CPA review in AutoVault360.",
};

export default function CpaSalesTaxPage() {
  return <CpaSalesTaxContent />;
}

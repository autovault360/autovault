import type { Metadata } from "next";
import WholesaleAddVehicleExpensePageContent from "@/components/dealer/expenses/add/wholesale-add-vehicle-expense-page-content";

export const metadata: Metadata = {
  title: "Add Vehicle Expense | Wholesale Dealer Dashboard",
  description: "Add a vehicle expense with VIN lookup, notes, payment details, and receipt upload.",
};

export default function DealerAddVehicleExpensePage() {
  return <WholesaleAddVehicleExpensePageContent />;
}

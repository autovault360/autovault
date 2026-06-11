import { Suspense } from "react";
import MessagesPage from "@/components/sales-rep/messages/messages-page";

export default function SalesRepMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPage />
    </Suspense>
  );
}

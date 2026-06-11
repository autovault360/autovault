import { Suspense } from "react";
import TeamChatPage from "@/components/sales-rep/team-chat/team-chat-page";

export default function SalesRepTeamChatPage() {
  return (
    <Suspense fallback={null}>
      <TeamChatPage />
    </Suspense>
  );
}

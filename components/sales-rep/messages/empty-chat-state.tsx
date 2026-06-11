"use client";

import { MessageSquare } from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/80 ring-1 ring-slate-700/60">
        <MessageSquare className="h-9 w-9 text-slate-500" />
      </div>
      <p className="max-w-xs text-[15px] font-medium text-slate-300">
        Select a conversation to start messaging
      </p>
      <p className="mt-2 max-w-sm text-[12px] text-slate-500">
        Search for a sales rep in the conversation list to begin a new chat.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Bot,
  ChevronDown,
  FileWarning,
  Receipt,
  FolderOpen,
  Package,
  Send,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PROMPTS = [
  { label: "Show missing receipts", icon: Receipt },
  { label: "Show payroll due", icon: Wallet },
  { label: "Show unreconciled expenses", icon: FileWarning },
  { label: "Show missing deal jackets", icon: FolderOpen },
  { label: "Generate CPA package", icon: Package },
];

export default function CpaAiAssistant() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <Card className="sticky top-4 rounded-lg border border-slate-700/80 bg-[#0b1322]/80 shadow-none">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between border-b border-slate-800 p-3"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-violet-400" />
          <span className="text-[12px] font-semibold text-white">AI CPA Assistant</span>
          <Badge variant="outline" className="border-violet-500/40 text-[9px] text-violet-400">
            BETA
          </Badge>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-500 transition-transform", collapsed && "-rotate-180")}
        />
      </button>
      {!collapsed && (
        <>
          <div className="space-y-1.5 p-3">
            {PROMPTS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-2 rounded-md border border-slate-800 bg-[#060d18] px-2.5 py-2 text-left text-[11px] text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-t border-slate-800 p-3">
            <Input
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 border-slate-700 bg-[#060d18] text-[11px]"
              readOnly
            />
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-blue-600 text-white"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

"use client";

import { useState } from "react";
import {
  AlertCircle,
  Car,
  Clock,
  DollarSign,
  FileText,
  Folder,
  Repeat,
  Send,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AiSuggestion, AiSuggestionIcon } from "@/lib/reminders/types";
import type { FilteredReminders } from "@/lib/reminders/types";
import { useRemindersAI, type AiMessage } from "./use-reminders-ai";

const iconMap: Record<AiSuggestionIcon, typeof Clock> = {
  clock: Clock,
  alert: AlertCircle,
  car: Car,
  dollar: DollarSign,
  repeat: Repeat,
  file: FileText,
  folder: Folder,
  wallet: Wallet,
};

const iconColorMap: Record<AiSuggestionIcon, string> = {
  clock: "text-sky-400 bg-sky-400/10",
  alert: "text-red-400 bg-red-400/10",
  car: "text-blue-500 bg-blue-500/10",
  dollar: "text-emerald-500 bg-emerald-500/10",
  repeat: "text-purple-400 bg-purple-400/10",
  file: "text-amber-500 bg-amber-500/10",
  folder: "text-indigo-400 bg-indigo-400/10",
  wallet: "text-cyan-400 bg-cyan-400/10",
};

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2 text-[12px] leading-relaxed",
        isUser
          ? "ml-6 bg-blue-600 text-white"
          : "mr-6 border border-slate-800 bg-[#111c30] text-slate-300",
      )}
    >
      {message.content}
    </div>
  );
}

type PanelProps = {
  suggestions: AiSuggestion[];
  filtered: FilteredReminders;
  onClose?: () => void;
  className?: string;
};

export function ReminderAIPanel({
  suggestions,
  filtered,
  onClose,
  className,
}: PanelProps) {
  const { messages, isLoading, sendMessage, sendSuggestion } =
    useRemindersAI(suggestions, filtered);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <Card
      className={cn(
        "flex h-full w-[320px] flex-col border border-slate-800 bg-[#070d19] shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-900 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 fill-blue-500/20 text-blue-500" />
          <span className="text-[13px] font-semibold tracking-wide text-slate-200">
            AI Assistant
          </span>
          <Badge
            variant="secondary"
            className="h-4 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-400"
          >
            BETA
          </Badge>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-6 w-6 place-items-center rounded text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-300"
            aria-label="Close AI Assistant"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-200">
            <span>Hello, John!</span>
            <span className="text-amber-400">??</span>
          </div>
          <p className="-mt-2 text-[12px] text-slate-400">
            How can I help you today?
          </p>

          {messages.length === 0 && (
            <div className="space-y-2 pt-1">
              {suggestions.map((suggestion) => {
                const Icon = iconMap[suggestion.icon];
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => sendSuggestion(suggestion)}
                    disabled={isLoading}
                    className="group flex w-full items-center gap-3 rounded-lg border border-slate-800/60 bg-[#0b1324] px-3 py-2.5 text-left transition-all hover:border-slate-700/80 hover:bg-[#0f1a30] disabled:opacity-50"
                  >
                    <div
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md transition-transform group-hover:scale-105",
                        iconColorMap[suggestion.icon],
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[12px] font-medium leading-snug text-slate-300 group-hover:text-slate-200">
                      {suggestion.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="mr-6 animate-pulse rounded-lg border border-slate-800 bg-[#111c30] px-3 py-2 text-[12px] text-slate-400">
              Analyzing reminders...
            </div>
          )}
        </div>

        <div className="border-t border-slate-900 bg-[#070d19] px-4 py-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0b1324] pl-3 pr-11 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none transition-colors focus:border-slate-700"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 h-7 w-7 rounded-md bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:bg-slate-800/50 disabled:text-slate-600"
              aria-label="Send message"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
          <p className="mt-2.5 text-center text-[10px] tracking-normal text-slate-600">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </Card>
  );
}

type Props = {
  suggestions: AiSuggestion[];
  filtered: FilteredReminders;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ReminderAiAssistant({
  suggestions,
  filtered,
  open,
  onOpenChange,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div className="sticky top-0 hidden h-screen shrink-0 self-start xl:block">
        <ReminderAIPanel
          suggestions={suggestions}
          filtered={filtered}
          onClose={() => onOpenChange(false)}
        />
      </div>

      <div className="xl:hidden">
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          onClick={() => onOpenChange(false)}
          aria-hidden
        />
        <div className="fixed inset-y-0 right-0 z-50 w-[320px]">
          <ReminderAIPanel
            suggestions={suggestions}
            filtered={filtered}
            onClose={() => onOpenChange(false)}
            className="h-full rounded-none border-y-0 border-r-0"
          />
        </div>
      </div>
    </>
  );
}

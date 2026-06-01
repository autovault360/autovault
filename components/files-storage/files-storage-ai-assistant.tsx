"use client";

import { useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Clock,
  Cloud,
  DollarSign,
  FileText,
  ImageIcon,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AiSuggestion, AiSuggestionIcon } from "@/lib/files-storage/types";
import {
  useFilesStorageAI,
  type AiMessage,
} from "./use-files-storage-ai";

const iconMap: Record<AiSuggestionIcon, typeof BarChart3> = {
  chart: BarChart3,
  clock: Clock,
  dollar: DollarSign,
  file: FileText,
  image: ImageIcon,
  cloud: Cloud,
  user: User,
  alert: AlertCircle,
};

// Exact color mappings matching the dashboard icons
const iconColorMap: Record<AiSuggestionIcon, string> = {
  chart: "text-blue-500 bg-blue-500/10",
  clock: "text-sky-400 bg-sky-400/10",
  dollar: "text-emerald-500 bg-emerald-500/10",
  file: "text-amber-500 bg-amber-500/10",
  image: "text-blue-400 bg-blue-400/10",
  cloud: "text-cyan-400 bg-cyan-400/10",
  user: "text-indigo-400 bg-indigo-400/10",
  alert: "text-red-400 bg-red-400/10",
};

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2 text-[12px] leading-relaxed",
        isUser
          ? "ml-6 bg-blue-600 text-white"
          : "mr-6 bg-[#111c30] border border-slate-800 text-slate-300",
      )}
    >
      {message.content}
    </div>
  );
}

type PanelProps = {
  suggestions: AiSuggestion[];
  onClose?: () => void;
  className?: string;
};

export function FilesStorageAIPanel({
  suggestions,
  onClose,
  className,
}: PanelProps) {
  const { messages, isLoading, sendMessage, sendSuggestion } =
    useFilesStorageAI(suggestions);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <Card
      className={cn(
        "flex h-full flex-col border border-slate-800 bg-[#070d19] shadow-2xl w-[320px]",
      )}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-900 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500 fill-blue-500/20" />
          <span className="text-[13px] font-semibold text-slate-200 tracking-wide">
            AI Assistant
          </span>
          <Badge
            variant="secondary"
            className="h-4 rounded bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-400 border border-blue-500/20"
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

      {/* Content Stream / Dynamic Layout */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-[13px] text-slate-200 font-medium">
            <span>Hello, John!</span>
            <span className="text-amber-400">👋</span>
          </div>
          <p className="text-[12px] text-slate-400 -mt-2">
            How can I help you today?
          </p>

          {/* Suggestions List (Shows when there are no messages) */}
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
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-800/60 bg-[#0b1324] px-3 py-2.5 text-left transition-all hover:border-slate-700/80 hover:bg-[#0f1a30] disabled:opacity-50 group"
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

          {/* Render Active Conversation Bubbles */}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="mr-6 rounded-lg bg-[#111c30] border border-slate-800 px-3 py-2 text-[12px] text-slate-400 animate-pulse">
              Analyzing files...
            </div>
          )}
        </div>

        {/* Input Form Footer */}
        <div className="border-t border-slate-900 px-4 py-4 bg-[#070d19]">
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
              className="absolute right-1.5 h-7 w-7 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-800/50 disabled:text-slate-600 transition-colors"
              aria-label="Send message"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
          <p className="mt-2.5 text-center text-[10px] text-slate-600 tracking-normal">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </Card>
  );
}

type Props = {
  suggestions: AiSuggestion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FilesStorageAIAssistant({
  suggestions,
  open,
  onOpenChange,
}: Props) {
  if (!open) return null;

  return (
    <>
      {/* Large Desktop Panel Sticky Sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 self-start xl:block">
        <FilesStorageAIPanel
          suggestions={suggestions}
          onClose={() => onOpenChange(false)}
        />
      </div>

      {/* Mobile/Tablet Fallback Drawer */}
      <div className="xl:hidden">
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          onClick={() => onOpenChange(false)}
          aria-hidden
        />
        <div className="fixed inset-y-0 right-0 z-50 w-[320px]">
          <FilesStorageAIPanel
            suggestions={suggestions}
            onClose={() => onOpenChange(false)}
            className="h-full rounded-none border-y-0 border-r-0"
          />
        </div>
      </div>
    </>
  );
}
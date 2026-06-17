"use client";

import { FormEvent, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Car,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  ReportsAiAnswer,
  ReportsAiSuggestion,
  ReportsAiSuggestionIcon,
  ReportsFilters,
} from "@/lib/reports-reminders/types";

const iconMap: Record<ReportsAiSuggestionIcon, typeof BarChart3> = {
  chart: BarChart3,
  dollar: DollarSign,
  alert: AlertCircle,
  car: Car,
  file: FileText,
  clock: Clock,
};

const iconColorMap: Record<ReportsAiSuggestionIcon, string> = {
  chart: "text-blue-500 bg-blue-500/10",
  dollar: "text-emerald-500 bg-emerald-500/10",
  alert: "text-red-400 bg-red-400/10",
  car: "text-blue-400 bg-blue-400/10",
  file: "text-amber-500 bg-amber-500/10",
  clock: "text-sky-400 bg-sky-400/10",
};

type Props = {
  suggestions: ReportsAiSuggestion[];
  filters: ReportsFilters;
  onClose?: () => void;
};

export default function ReportsAiAssistant({ suggestions, filters, onClose }: Props) {
  const [input, setInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [answer, setAnswer] = useState<ReportsAiAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports-reminders/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, filters }),
      });
      if (!response.ok) throw new Error("Assistant request failed");
      setAnswer((await response.json()) as ReportsAiAnswer);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <Card className="flex w-full flex-col overflow-hidden rounded-sm border border-slate-700 bg-[#070d19] shadow-none">
      <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 fill-blue-500/20 text-blue-500" />
          <span className="truncate text-[10px] font-bold tracking-[0.1em] text-slate-300">
            AI REPORT ASSISTANT
          </span>
          <Badge
            variant="secondary"
            className="h-4 shrink-0 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-400"
          >
            BETA
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => (onClose ? onClose() : setCollapsed((c) => !c))}
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          aria-label={onClose ? "Close AI Report Assistant" : "Collapse panel"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="max-h-[340px] space-y-3 overflow-y-auto px-3.5 py-3.5">
            <p className="text-[12px] font-medium text-slate-200">Hello, John!</p>
            <p className="text-[11.5px] text-slate-500">
              How can I help with your reports today?
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => {
                const Icon = iconMap[s.icon];
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => ask(s.label)}
                    className="group flex w-full items-start gap-2.5 rounded-lg border border-slate-800/80 bg-[#0b1324] px-2.5 py-2 text-left transition hover:border-slate-700 hover:bg-[#0f1a30]"
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md",
                        iconColorMap[s.icon],
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="pt-0.5 text-[11px] leading-snug text-slate-300 group-hover:text-slate-200">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {loading && (
              <div className="rounded border border-slate-800 bg-[#0b1324] p-2.5 text-[11px] text-slate-400">
                Reading report data...
              </div>
            )}
            {error && (
              <div className="rounded border border-red-500/30 bg-red-500/10 p-2.5 text-[11px] text-red-200">
                {error}
              </div>
            )}
            {answer && (
              <div className="rounded border border-blue-500/20 bg-blue-500/10 p-2.5">
                <p className="text-[11px] leading-relaxed text-slate-200">
                  {answer.answer}
                </p>
                {answer.highlights.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {answer.highlights.slice(0, 4).map((metric) => (
                      <div key={metric.label} className="rounded bg-[#07101f] p-2">
                        <div className="truncate text-[9px] uppercase tracking-wide text-slate-500">
                          {metric.label}
                        </div>
                        <div className="mt-0.5 text-[12px] font-bold text-emerald-400">
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-3">
            <form className="relative" onSubmit={handleSubmit}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="h-9 w-full rounded-md border border-slate-700 bg-[#0e1626] pr-10 pl-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus-visible:border-blue-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading}
                className="absolute top-1 right-1 h-7 w-7 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                aria-label="Send"
              >
                <Send className="h-3 w-3" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[9px] text-slate-600">
              AI can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

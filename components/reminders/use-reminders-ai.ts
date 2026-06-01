"use client";

import { useCallback, useState } from "react";
import type { AiSuggestion } from "@/lib/reminders/types";
import type { FilteredReminders } from "@/lib/reminders/types";
import { formatCurrency } from "@/lib/reminders/format-utils";

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function buildResponses(filtered: FilteredReminders): Record<string, string> {
  const dueToday = filtered.upcomingReminders.filter(
    (r) => r.dueDate === filtered.report.reminders[0]?.dueDate,
  );
  const overdueCount = filtered.overdueReminders.length;
  const vehicleOver60 = filtered.report.reminders.filter(
    (r) => r.category === "vehicle" && r.title.includes("60"),
  );
  const weekPayments = filtered.upcomingPayments;
  const recurring = filtered.recurringPayments;
  const taxFilings = filtered.report.reminders.filter(
    (r) => r.category === "accounting" && !r.completed,
  );
  const dealDocs = filtered.report.reminders.filter((r) => r.category === "deal");

  return {
    "sug-1": `You have ${filtered.kpis.find((k) => k.id === "due_today")?.count ?? 0} items due today, including ${dueToday.slice(0, 3).map((r) => r.title).join(", ") || "CDTFA Filing Due and Payroll Due"}.`,
    "sug-2": `There are ${overdueCount} overdue reminders requiring immediate action. Top items: ${filtered.overdueReminders.slice(0, 3).map((r) => r.title).join(", ") || "Smog Certificate, Sales Tax Payment"}.`,
    "sug-3": vehicleOver60.length
      ? `${vehicleOver60.length} vehicle(s) over 60 days: ${vehicleOver60.map((r) => r.title).join(", ")}.`
      : "3 vehicles are over 60 days on lot: 2019 Toyota Camry, 2018 Ford F-150, and 2020 Honda Accord.",
    "sug-4": weekPayments.length
      ? `${weekPayments.length} payments due this week totaling ${formatCurrency(filtered.totalObligations)}: ${weekPayments.map((p) => p.name).join(", ")}.`
      : "5 payments due this week totaling $24,550.00.",
    "sug-5": `${recurring.length} recurring payments: ${recurring.slice(0, 4).map((p) => `${p.vendor} (${formatCurrency(p.amount)}/mo)`).join(", ")}.`,
    "sug-6": `${taxFilings.length} tax filings due this month, including CDTFA Filing Due and Quarterly Tax Estimate.`,
    "sug-7": `${dealDocs.length} deal jacket items need attention: ${dealDocs.slice(0, 2).map((r) => r.title).join(", ")} - missing buyer ID and smog certificates.`,
    "sug-8": `You need ${formatCurrency(filtered.totalObligations)} for upcoming obligations in the next 30 days, including payroll, rent, commissions, and insurance.`,
  };
}

export function useRemindersAI(
  suggestions: AiSuggestion[],
  filtered: FilteredReminders,
) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    (content: string, suggestionId?: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMsg: AiMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      setTimeout(() => {
        const responses = buildResponses(filtered);
        const response =
          suggestionId != null
            ? responses[suggestionId] ??
              `Here's what I found regarding "${trimmed}". This is a mock response - connect the AI backend for live results.`
            : `I searched your reminders for "${trimmed}". This is a mock response - connect the AI backend for live results.`;

        const assistantMsg: AiMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
      }, 600);
    },
    [filtered],
  );

  const sendSuggestion = useCallback(
    (suggestion: AiSuggestion) => {
      sendMessage(suggestion.label, suggestion.id);
    },
    [sendMessage],
  );

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    sendSuggestion,
  };
}

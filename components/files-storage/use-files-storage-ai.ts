"use client";

import { useCallback, useState } from "react";
import type { AiSuggestion, AiSuggestionIcon } from "@/lib/files-storage/types";

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const MOCK_RESPONSES: Record<string, string> = {
  "sug-1":
    "Found 47 deal jackets uploaded this month across Deal Jackets folder. The most recent is RO-1012_DealJacket.pdf uploaded today at 10:24 AM.",
  "sug-2":
    "12 expenses are missing receipts: 8 vehicle reconditioning, 3 office supplies, and 1 marketing expense from May 2025.",
  "sug-3":
    "Your top 3 profitable vehicles this month: 2021 Honda Accord (+$4,250), 2019 Toyota Camry (+$3,890), 2020 Ford F-150 (+$3,120).",
  "sug-4":
    "Deal RO-1012 is missing: Buyer ID copy, Smog certificate, and Odometer disclosure. 8 of 11 required documents are on file.",
  "sug-5":
    "You have 2 pending CDTFA filings: Q1 2025 sales tax return (due May 31) and April 2025 monthly report (due May 20).",
  "sug-6":
    "You have 391.55 GB of storage remaining (38.3% free) out of your 1,024 GB plan.",
  "sug-7":
    "Found 234 vehicle photos uploaded this week, mostly in Vehicle Photos folder. Latest: VIN_Photo_Front.jpg.",
  "sug-8":
    "3 contracts are expiring within 30 days: Floor plan agreement (Jun 5), Marketing vendor contract (Jun 12), Insurance policy (Jun 18).",
};

function getMockResponse(suggestionId: string, label: string): string {
  return (
    MOCK_RESPONSES[suggestionId] ??
    `Here's what I found regarding "${label}". This is a mock response - connect the AI backend for live results.`
  );
}

export function useFilesStorageAI(suggestions: AiSuggestion[]) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback((content: string, suggestionId?: string) => {
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
      const response =
        suggestionId != null
          ? getMockResponse(suggestionId, trimmed)
          : `I searched your dealership files for "${trimmed}". This is a mock response - connect the AI backend for live results.`;

      const assistantMsg: AiMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 600);
  }, []);

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

export type { AiSuggestionIcon };

"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function MessageComposer({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;

    setText("");
    onSend(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-800/80 bg-[#0a1524] px-5 py-4"
    >
      <div className="flex items-end gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-[13.5px] text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

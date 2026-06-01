"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";
import { formatAsOfDate } from "@/lib/files-storage/format-utils";

type Props = {
  asOfDate: string;
  onDateChange: (date: string) => void;
};

export default function FilesStorageHeader({ asOfDate, onDateChange }: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
      <div>
        <h1 className="text-2xl font-bold text-white">Files & Storage</h1>
        <p className="mt-0.5 text-[12.5px] text-slate-500">
          Secure cloud storage for all dealership documents, receipts, images, and
          important files.
        </p>
      </div>

      <button
        type="button"
        onClick={() => dateInputRef.current?.showPicker?.()}
        className="flex h-9 items-center gap-2 rounded-md border border-slate-700 bg-transparent px-3.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-white"
      >
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        {formatAsOfDate(asOfDate)}
        <input
          ref={dateInputRef}
          type="date"
          value={asOfDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="sr-only"
          aria-hidden
        />
      </button>
    </section>
  );
}

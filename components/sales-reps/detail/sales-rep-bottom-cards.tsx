"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
} from "lucide-react";
import { ReportCardShell } from "@/components/reports-reminders/report-card-primitives";
import { cn } from "@/lib/utils";
import { formatProfileDate } from "@/lib/sales-reps/profile-types";
import type {
  SalesRepAppointment,
  SalesRepDealJacketItem,
  SalesRepDocument,
  SalesRepFollowUp,
  SalesRepInternalNote,
  SalesRepNoteTone,
} from "@/lib/sales-reps/profile-types";

const DOT_COLORS: Record<SalesRepAppointment["dotColor"], string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  orange: "bg-amber-500",
  purple: "bg-purple-500",
};

const NOTE_TONE_STYLES: Record<
  SalesRepNoteTone,
  { box: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  green: {
    box: "border-emerald-500/25 bg-emerald-500/10",
    icon: "text-emerald-400",
    Icon: CheckCircle2,
  },
  blue: {
    box: "border-blue-500/25 bg-blue-500/10",
    icon: "text-blue-400",
    Icon: Info,
  },
  orange: {
    box: "border-amber-500/25 bg-amber-500/10",
    icon: "text-amber-400",
    Icon: AlertCircle,
  },
};

type Props = {
  followUps: SalesRepFollowUp[];
  appointments: SalesRepAppointment[];
  notes: SalesRepInternalNote[];
  documents: SalesRepDocument[];
  dealJackets: SalesRepDealJacketItem[];
};

export default function SalesRepBottomCards({
  followUps,
  appointments,
  notes,
  documents,
  dealJackets,
}: Props) {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-5">
      <FollowUpsCard followUps={followUps} />
      <AppointmentsCard appointments={appointments} />
      <NotesCard notes={notes} />
      <DocumentsCard documents={documents} />
      <DealJacketsCard dealJackets={dealJackets} />
    </section>
  );
}

function CardHeaderLink({
  title,
  linkLabel,
}: {
  title: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <h2 className="text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        {title}
      </h2>
      <button
        type="button"
        className="shrink-0 text-[11px] font-medium text-blue-400 hover:text-blue-300"
      >
        {linkLabel} �†’
      </button>
    </div>
  );
}

function FollowUpsCard({ followUps }: { followUps: SalesRepFollowUp[] }) {
  return (
    <ReportCardShell className="flex flex-col">
      <CardHeaderLink
        title={`Customer Follow-Ups (${followUps.length})`}
        linkLabel="View All"
      />
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-2 text-left">Customer</th>
              <th className="pb-2 pr-2 text-left">Vehicle Interested In</th>
              <th className="pb-2 pr-2 text-left">Last Contact</th>
              <th className="pb-2 text-left">Next Follow-Up</th>
            </tr>
          </thead>
          <tbody>
            {followUps.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-800/40 last:border-0"
              >
                <td className="py-2.5 pr-2 font-medium text-slate-200">
                  {row.customer}
                </td>
                <td className="max-w-[100px] truncate py-2.5 pr-2 text-slate-400">
                  {row.vehicleInterested}
                </td>
                <td className="py-2.5 pr-2 text-slate-400 tabular-nums">
                  {formatProfileDate(row.lastContact)}
                </td>
                <td className="py-2.5 text-slate-400 tabular-nums">
                  {formatProfileDate(row.nextFollowUp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportCardShell>
  );
}

function AppointmentsCard({ appointments }: { appointments: SalesRepAppointment[] }) {
  return (
    <ReportCardShell className="flex flex-col">
      <CardHeaderLink title="Calendar & Appointments" linkLabel="View Calendar" />
      <ul className="min-h-0 flex-1 space-y-2.5">
        {appointments.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2 border-b border-slate-800/40 pb-2.5 last:border-0"
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                DOT_COLORS[item.dotColor],
              )}
            />
            <div className="min-w-0 flex-1 text-[11px] leading-snug">
              <div className="text-slate-400 tabular-nums">
                {formatProfileDate(item.date)} · {item.time}
              </div>
              <div className="mt-0.5 font-medium text-slate-200">{item.event}</div>
            </div>
          </li>
        ))}
      </ul>
    </ReportCardShell>
  );
}

function NotesCard({ notes }: { notes: SalesRepInternalNote[] }) {
  return (
    <ReportCardShell className="flex flex-col">
      <CardHeaderLink title="Notes (Internal)" linkLabel="+ Add Note" />
      <ul className="min-h-0 flex-1 space-y-2">
        {notes.map((note) => {
          const tone = NOTE_TONE_STYLES[note.tone];
          const ToneIcon = tone.Icon;
          return (
            <li
              key={note.id}
              className={cn(
                "rounded-md border px-2.5 py-2",
                tone.box,
              )}
            >
              <div className="flex items-start gap-2">
                <ToneIcon
                  className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", tone.icon)}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-500">
                    {formatProfileDate(note.date)}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-200">
                    {note.content}
                  </p>
                  <div className="mt-1 text-[10px] text-slate-500">
                    �€” {note.author}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </ReportCardShell>
  );
}

function DocumentsCard({ documents }: { documents: SalesRepDocument[] }) {
  return (
    <ReportCardShell className="flex flex-col">
      <CardHeaderLink title="Documents" linkLabel="View All" />
      <ul className="min-h-0 flex-1 space-y-2.5">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-start gap-2.5 border-b border-slate-800/40 pb-2.5 last:border-0"
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-slate-200">
                {doc.name}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                Uploaded {formatProfileDate(doc.uploadedAt)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ReportCardShell>
  );
}

function DealJacketsCard({ dealJackets }: { dealJackets: SalesRepDealJacketItem[] }) {
  return (
    <ReportCardShell className="flex flex-col">
      <CardHeaderLink title="Deal Jackets (This Month)" linkLabel="View All" />
      <ul className="min-h-0 flex-1 space-y-2.5">
        {dealJackets.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 border-b border-slate-800/40 pb-2.5 last:border-0"
          >
            <div className="flex min-w-0 items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold text-slate-200">
                  {item.jacketNumber}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  {formatProfileDate(item.date)} · {item.stockNumber}
                </div>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-400">
              Completed
            </span>
          </li>
        ))}
      </ul>
    </ReportCardShell>
  );
}

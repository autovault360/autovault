import { ArrowRight, Lightbulb } from "lucide-react";

const STEPS = [
  {
    title: "You close the deal",
    description:
      "You mark the vehicle as sold and create the deal jacket.",
  },
  {
    title: "Admin reviews the deal",
    description:
      "Admin reviews documents, information, and compliance.",
  },
  {
    title: "Changes or approval",
    description:
      "If changes are needed, admin will request updates. If approved, the sale is finalized.",
  },
  {
    title: "You earn your commission",
    description:
      "Once approved, your commission will be calculated and added to your account.",
  },
];

export default function VehicleAlertsHowItWorks() {
  return (
    <section className="mt-4 rounded-sm border border-slate-700/80 bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h2 className="text-[13px] font-bold tracking-wide text-white">
          How Vehicle Approval Works
        </h2>
      </div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-2">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex min-w-0 flex-1 items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-500/15 text-[11px] font-bold text-blue-400">
                  {index + 1}
                </span>
                <h3 className="text-[12px] font-semibold text-white">
                  {step.title}
                </h3>
              </div>
              <p className="mt-1.5 pl-8 text-[11px] leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-slate-600 xl:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

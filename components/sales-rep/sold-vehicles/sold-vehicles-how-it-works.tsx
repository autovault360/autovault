import { BarChart3, Car, ClipboardList, DollarSign } from "lucide-react";

const STEPS = [
  {
    icon: Car,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    title: "Close the Deal",
    description:
      "When you sell a vehicle, the deal is marked as Sold by Admin.",
  },
  {
    icon: ClipboardList,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    title: "Appears in My Sold",
    description:
      "The vehicle automatically appears in your My Sold Vehicles list.",
  },
  {
    icon: DollarSign,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    title: "Earn Your Commission",
    description:
      "Your commission is calculated based on the gross profit and your rate.",
  },
  {
    icon: BarChart3,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    title: "Track Performance",
    description:
      "Monitor your sales, profit, and commission in real time.",
  },
];

export default function SoldVehiclesHowItWorks() {
  return (
    <section className="mt-4 rounded-sm border border-slate-700/80 bg-card p-4">
      <h2 className="mb-4 text-[13px] font-bold tracking-wide text-white">
        How My Sold Vehicles Works
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.title} className="flex gap-3">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${step.bg}`}
            >
              <step.icon className={`h-5 w-5 ${step.color}`} />
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

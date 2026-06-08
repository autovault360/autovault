import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export default function EmployeePayrollSkeleton() {
  return (
    <div>
      <SkeletonBar className="mb-3 h-4 w-64" />
      <div className="mb-3.5 flex justify-between gap-3">
        <SkeletonBar className="h-20 w-full max-w-xl" />
        <SkeletonBar className="h-9 w-72" />
      </div>
      <SkeletonBar className="mb-3.5 h-24 w-full" />
      <SkeletonBar className="mb-3.5 h-10 w-64" />
      <div className="grid gap-3.5 xl:grid-cols-12">
        <div className="space-y-3.5 xl:col-span-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none" />
          ))}
        </div>
        <div className="space-y-3.5 xl:col-span-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-56 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none" />
          ))}
        </div>
        <div className="space-y-3.5 xl:col-span-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-40 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none" />
          ))}
        </div>
      </div>
    </div>
  );
}

import AdminHeader from "@/components/layout/AdminHeader";

export default function SalesRepProfileSkeleton() {
  return (
    <div className="relative pb-8 animate-pulse">
      <AdminHeader />

      <div className="mb-3 flex items-center gap-1.5">
        <SkeletonBar className="h-3 w-20" />
        <SkeletonBar className="h-3 w-3" />
        <SkeletonBar className="h-3 w-28" />
      </div>

      <div className="mb-3.5 flex flex-col gap-3.5 xl:flex-row xl:items-start xl:gap-4">
        <div className="min-w-0 flex-1 rounded-lg border border-slate-800/90 p-4 lg:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <SkeletonBar className="h-[88px] w-[88px] rounded-full" />
                <SkeletonBar className="h-5 w-14 rounded-full" />
              </div>
              <div className="space-y-2">
                <SkeletonBar className="h-6 w-40" />
                <SkeletonBar className="h-4 w-32" />
                <SkeletonBar className="h-3 w-44" />
                <SkeletonBar className="h-3 w-52" />
              </div>
            </div>
            <div className="min-w-[220px] space-y-2 border-t border-slate-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 w-full" />
              ))}
            </div>
            <SkeletonBar className="mx-auto h-9 w-28 lg:mx-0 lg:ml-auto" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 xl:min-w-[340px]">
          <div className="flex flex-wrap gap-2">
            <SkeletonBar className="h-9 w-28" />
            <SkeletonBar className="h-9 w-44" />
            <SkeletonBar className="h-9 w-28" />
          </div>
          <SkeletonBar className="h-9 w-full" />
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBar key={i} className="h-[156px] rounded-sm border border-slate-700" />
        ))}
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <SkeletonBar className="h-72 rounded-sm border border-slate-700 xl:col-span-5" />
        <SkeletonBar className="h-72 rounded-sm border border-slate-700 xl:col-span-4" />
        <SkeletonBar className="h-72 rounded-sm border border-slate-700 xl:col-span-3" />
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBar key={i} className="h-48 rounded-sm border border-slate-700" />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-12">
        <SkeletonBar className="h-[148px] rounded-sm border border-slate-700 xl:col-span-5" />
        <SkeletonBar className="h-[148px] rounded-sm border border-slate-700 xl:col-span-7" />
      </div>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function AdminHeaderSkeleton() {
  return (
    <header className="mb-3.5 flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
      <SkeletonBar className="h-10 w-full max-w-[400px]" />
      <div className="flex items-center gap-3">
        <SkeletonBar className="h-8 w-8 rounded-full" />
        <SkeletonBar className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}

export default function FilesStoragePageSkeleton() {
  return (
    <div className="files-storage-page relative">
      <AdminHeaderSkeleton />

      <div className="flex gap-3.5">
        <div className="min-w-0 flex-1">
          <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
            <div className="space-y-2">
              <SkeletonBar className="h-8 w-48" />
              <SkeletonBar className="h-4 w-96 max-w-full" />
            </div>
            <SkeletonBar className="h-9 w-36" />
          </section>

          <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none"
              >
                <div className="flex items-start gap-2.5">
                  <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <SkeletonBar className="h-3 w-24" />
                    <SkeletonBar className="h-5 w-28" />
                    <SkeletonBar className="h-3 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </section>

          <Card className="mb-3.5 rounded-sm border border-slate-800/50 bg-transparent p-4 shadow-none">
            <div className="mb-3 flex justify-between">
              <SkeletonBar className="h-3 w-32" />
              <SkeletonBar className="h-3 w-40" />
            </div>
            <SkeletonBar className="h-2.5 w-full rounded-full" />
            <div className="mt-3 flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBar key={i} className="h-3 w-24" />
              ))}
            </div>
          </Card>

          <div className="mb-3.5 grid gap-3.5 lg:grid-cols-[1fr_320px]">
            <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
              <SkeletonBar className="mb-3 h-8 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBar key={i} className="mb-2 h-10 w-full" />
              ))}
            </Card>
            <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
              <SkeletonBar className="mb-3 h-3 w-32" />
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBar key={i} className="mb-3 h-12 w-full" />
              ))}
            </Card>
          </div>

          <div className="grid gap-3.5 md:grid-cols-2">
            <Card className="rounded-sm border border-slate-800/50 bg-transparent p-4 shadow-none">
              <SkeletonBar className="h-40 w-full rounded-md" />
            </Card>
            <Card className="rounded-sm border border-slate-800/50 bg-transparent p-4 shadow-none">
              <SkeletonBar className="mb-4 h-3 w-24" />
              <div className="flex gap-4">
                <SkeletonBar className="h-[100px] w-[100px] shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBar key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="hidden w-[320px] shrink-0 xl:block">
          <Card className="sticky top-5 min-h-[calc(100vh-6rem)] rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="mb-4 h-6 w-40" />
            <SkeletonBar className="mb-3 h-4 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBar key={i} className="mb-2 h-12 w-full" />
            ))}
            <SkeletonBar className="mt-4 h-9 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

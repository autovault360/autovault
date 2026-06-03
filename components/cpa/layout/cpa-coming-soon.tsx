export default function CpaComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-slate-800 bg-[#0b1322]/60 p-12 text-center">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        This section is coming soon. Use the CPA Dashboard for financial overview
        and CPA Notes for dealership communication.
      </p>
    </div>
  );
}

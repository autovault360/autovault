import { PageHeaderTitle } from "@/components/layout/page-header-title";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeaderTitle
        title="Settings"
        subtitle="Platform settings and configuration."
        subtitleClassName="text-sm text-zinc-500"
      />
      <div className="rounded-xl border border-zinc-900/60 bg-[#0c0e10]/60 p-8 text-center">
        <p className="text-zinc-500">Coming soon.</p>
      </div>
    </div>
  );
}

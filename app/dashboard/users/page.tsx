import { PageHeaderTitle } from "@/components/layout/page-header-title";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeaderTitle
        title="Users"
        subtitle="Manage all users across the platform."
        subtitleClassName="text-sm text-zinc-500"
      />
      <div className="rounded-xl border border-zinc-900/60 bg-[#0c0e10]/60 p-8 text-center">
        <p className="text-zinc-500">Coming soon.</p>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createMyProfile } from "@/lib/setup/create-profile";

export default async function SetupPage() {
  const result = await createMyProfile();

  if (result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="rounded-lg border border-green-500/30 bg-green-950/20 p-8 text-center">
          <p className="text-lg text-green-400">Profile created successfully!</p>
          <p className="mt-2 text-sm text-slate-400">You can now go back to the dashboard and try again.</p>
          <a href="/dashboard" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300 underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (result.error === "Profile already exists") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-8 text-center">
        <p className="text-lg text-red-400">Error: {result.error}</p>
        <a href="/dashboard" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300 underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

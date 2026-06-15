import { redirect } from "next/navigation";
import ProfilePageShell from "@/components/profile/profile-page-shell";
import CpaProfileForm from "@/components/profile/cpa-profile-form";
import { getMyProfile } from "@/lib/profiles/server/get-my-profile";

export default async function CpaProfilePage() {
  const result = await getMyProfile();

  if (!result.ok) {
    redirect("/cpa/login");
  }

  if (result.profile.role !== "cpa") {
    redirect("/cpa/dashboard");
  }

  return (
    <ProfilePageShell
      title="My Profile"
      subtitle="Update your personal information and profile photo."
    >
      <CpaProfileForm profile={result.profile} />
    </ProfilePageShell>
  );
}

import { redirect } from "next/navigation";
import ProfilePageShell from "@/components/profile/profile-page-shell";
import WholesaleDealerProfileForm from "@/components/profile/wholesale-dealer-profile-form";
import { getMyProfile } from "@/lib/profiles/server/get-my-profile";

export default async function DealerProfilePage() {
  const result = await getMyProfile();

  if (!result.ok) {
    redirect("/dealer/login");
  }

  if (result.profile.role !== "wholesale_dealer") {
    redirect("/dealer/dashboard");
  }

  return (
    <ProfilePageShell
      title="My Profile"
      subtitle="Manage your business information and contact details."
    >
      <WholesaleDealerProfileForm profile={result.profile} />
    </ProfilePageShell>
  );
}

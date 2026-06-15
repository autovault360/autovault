import { redirect } from "next/navigation";
import ProfilePageShell from "@/components/profile/profile-page-shell";
import SalesRepProfileForm from "@/components/profile/sales-rep-profile-form";
import { getMyProfile } from "@/lib/profiles/server/get-my-profile";

export default async function SalesRepProfilePage() {
  const result = await getMyProfile();

  if (!result.ok) {
    redirect("/sales-rep/login");
  }

  if (result.profile.role !== "sales_rep") {
    redirect("/sales-rep/dashboard");
  }

  return (
    <ProfilePageShell
      title="My Profile"
      subtitle="Update your contact information and profile photo."
    >
      <SalesRepProfileForm profile={result.profile} />
    </ProfilePageShell>
  );
}

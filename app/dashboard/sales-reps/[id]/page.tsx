import { notFound } from "next/navigation";
import SalesRepProfileShell from "@/components/sales-reps/detail/sales-rep-profile-shell";
import { getSalesRepProfile } from "@/lib/sales-reps/server/get-sales-rep-profile";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SalesRepProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getSalesRepProfile(id);

  if (!profile) {
    notFound();
  }

  return <SalesRepProfileShell profile={profile} />;
}

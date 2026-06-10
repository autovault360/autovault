"use client";

import { AppSidebar } from "@/components/layout/sidebar";
import type { SidebarGroup, SidebarItem } from "@/components/layout/sidebar";

type Props = {
  groups: SidebarGroup[];
  profile?: React.ReactNode;
  logoLabel?: string;
  isActive?: (item: SidebarItem) => boolean;
  onNavigate?: (item: SidebarItem) => void;
};

export default function UnifiedSidebar({ groups, profile, logoLabel, isActive, onNavigate }: Props) {
  return (
    <AppSidebar
      groups={groups}
      profile={profile}
      logoLabel={logoLabel}
      logoWidth={200}
      logoHeight={40}
      isActive={isActive}
      onNavigate={onNavigate}
    />
  );
}

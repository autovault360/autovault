"use client";

import { AppSidebar } from "@/components/layout/sidebar";
import type { SidebarGroup, SidebarItem } from "@/components/layout/sidebar";

type Props = {
  groups: SidebarGroup[];
  profile?: React.ReactNode;
  logoLabel?: string;
  isActive?: (item: SidebarItem) => boolean;
  onNavigate?: (item: SidebarItem) => void;
  renderItem?: (item: SidebarItem, defaultRender: () => React.ReactNode) => React.ReactNode;
};

export default function UnifiedSidebar({ groups, profile, logoLabel, isActive, onNavigate, renderItem }: Props) {
  return (
    <AppSidebar
      groups={groups}
      profile={profile}
      logoLabel={logoLabel}
      logoWidth={200}
      logoHeight={40}
      isActive={isActive}
      onNavigate={onNavigate}
      renderItem={renderItem}
    />
  );
}

import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  exact?: boolean;
  comingSoon?: boolean;
  badge?: number | string;
  badgeColor?: string;
  color?: string;
  subItems?: SidebarItem[];
  sectionId?: string;
  onClick?: () => void;
};

export type SidebarGroup = {
  label: string | null;
  items: SidebarItem[];
};

export type SidebarProps = {
  groups: SidebarGroup[];
  logoLabel?: string;
  logoWidth?: number;
  logoHeight?: number;
  profile?: React.ReactNode;
  isActive?: (item: SidebarItem) => boolean;
  onNavigate?: (item: SidebarItem) => void;
  renderItem?: (item: SidebarItem, defaultRender: () => React.ReactNode) => React.ReactNode;
};

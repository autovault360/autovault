export const SALES_REPS = [
  {
    id: "rep-mike",
    name: "Mike Johnson",
    avatarUrl: "https://i.pravatar.cc/64?img=11",
    initials: "MJ",
  },
  {
    id: "rep-sarah",
    name: "Sarah Williams",
    avatarUrl: "https://i.pravatar.cc/64?img=5",
    initials: "SW",
  },
  {
    id: "rep-tom",
    name: "Tom Davis",
    avatarUrl: "https://i.pravatar.cc/64?img=33",
    initials: "TD",
  },
  {
    id: "rep-lisa",
    name: "Lisa Chen",
    avatarUrl: "https://i.pravatar.cc/64?img=9",
    initials: "LC",
  },
  {
    id: "rep-james",
    name: "James Wilson",
    avatarUrl: "https://i.pravatar.cc/64?img=15",
    initials: "JW",
  },
] as const;

export const LOCATIONS = [
  { id: "all", label: "All Locations" },
  { id: "main", label: "Main Lot" },
  { id: "north", label: "North Branch" },
] as const;

export const HEATMAP_COLORS: Record<string, string> = {
  none: "bg-slate-600",
  low: "bg-emerald-500",
  mid: "bg-blue-500",
  high: "bg-purple-500",
};

export const UNIT_PILL_STYLES: Record<string, string> = {
  none: "",
  low: "bg-emerald-500/20 text-emerald-400",
  mid: "bg-blue-500/20 text-blue-400",
  high: "bg-purple-500/20 text-purple-400",
};

export const YEARLY_TARGETS: Record<number, { units: number; gross: number; commissions: number }> = {
  2024: { units: 689, gross: 5430000, commissions: 927000 },
  2025: { units: 856, gross: 6842450, commissions: 1092340 },
};

export const MONTHLY_UNIT_TARGETS_2025 = [42, 58, 72, 65, 98, 85, 76, 82, 68, 74, 88, 48];

export const VEHICLE_IMAGES = [
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=80&h=60&fit=crop",
  "https://images.unsplash.com/photo-1494976388531-d105849893bf?w=80&h=60&fit=crop",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=80&h=60&fit=crop",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=80&h=60&fit=crop",
  "https://images.unsplash.com/photo-1583121274602-3e2820c50fa8?w=80&h=60&fit=crop",
];

export const TOP_VEHICLES = [
  { makeModel: "2023 Toyota Camry", imageUrl: VEHICLE_IMAGES[0]! },
  { makeModel: "2022 Honda Accord", imageUrl: VEHICLE_IMAGES[1]! },
  { makeModel: "2024 Ford F-150", imageUrl: VEHICLE_IMAGES[2]! },
  { makeModel: "2021 BMW 3 Series", imageUrl: VEHICLE_IMAGES[3]! },
  { makeModel: "2023 Chevy Silverado", imageUrl: VEHICLE_IMAGES[4]! },
];

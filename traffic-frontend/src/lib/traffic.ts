import type { AlertPriority, AlertType, CongestionLevel } from "@/types";

export const congestionMeta: Record<
  CongestionLevel,
  { label: string; color: string; hex: string; badge: string }
> = {
  low: {
    label: "Low",
    color: "text-emerald-400",
    hex: "#34d399",
    badge: "low",
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-400",
    hex: "#fbbf24",
    badge: "moderate",
  },
  heavy: {
    label: "Heavy",
    color: "text-orange-400",
    hex: "#fb923c",
    badge: "heavy",
  },
  severe: {
    label: "Severe",
    color: "text-red-400",
    hex: "#f87171",
    badge: "severe",
  },
};

export const priorityMeta: Record<
  AlertPriority,
  { label: string; color: string; hex: string }
> = {
  critical: { label: "Critical", color: "text-red-400", hex: "#f87171" },
  high: { label: "High", color: "text-orange-400", hex: "#fb923c" },
  medium: { label: "Medium", color: "text-amber-400", hex: "#fbbf24" },
  low: { label: "Low", color: "text-emerald-400", hex: "#34d399" },
};

export const alertTypeMeta: Record<
  AlertType,
  { label: string; icon: string }
> = {
  accident: { label: "Accident", icon: "car-front" },
  roadblock: { label: "Road Block", icon: "construction" },
  weather: { label: "Weather", icon: "cloud-rain" },
  emergency: { label: "Emergency", icon: "siren" },
  construction: { label: "Construction", icon: "hard-hat" },
};

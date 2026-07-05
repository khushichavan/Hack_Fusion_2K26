import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Brain,
  CarFront,
  Cctv,
  CloudRain,
  Construction,
  FileDown,
  HardHat,
  LogIn,
  Siren,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  "trending-up": TrendingUp,
  brain: Brain,
  cctv: Cctv,
  "alert-triangle": AlertTriangle,
  "alert-octagon": AlertOctagon,
  "car-front": CarFront,
  "cloud-rain": CloudRain,
  construction: Construction,
  "hard-hat": HardHat,
  siren: Siren,
  "file-down": FileDown,
  "log-in": LogIn,
};

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = iconMap[name] ?? Activity;
  return <Cmp className={className} />;
}

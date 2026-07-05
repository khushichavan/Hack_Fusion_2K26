import {
  LayoutDashboard,
  Map,
  Sparkles,
  BarChart3,
  Cctv,
  BellRing,
  History,
  Settings,
  User,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
      { label: "Live Map", to: "/app/map", icon: Map },
      { label: "Prediction", to: "/app/prediction", icon: Sparkles },
      { label: "Analytics", to: "/app/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { label: "Cameras", to: "/app/cameras", icon: Cctv },
      { label: "Alert Center", to: "/app/alerts", icon: BellRing, badge: "5" },
      { label: "History", to: "/app/history", icon: History },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", to: "/app/profile", icon: User },
      { label: "Settings", to: "/app/settings", icon: Settings },
      { label: "Admin", to: "/app/admin", icon: ShieldCheck },
    ],
  },
];

export const flatNav: NavItem[] = navSections.flatMap((s) => s.items);

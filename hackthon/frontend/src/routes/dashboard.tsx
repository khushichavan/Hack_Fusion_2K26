import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Bell, Gauge, LifeBuoy, Map, Settings, Siren, SlidersHorizontal, User } from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/DashboardLayout";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  component: UserDashboardLayout,
});

const items: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/dashboard/location", label: "Water Map", icon: Map },
  { to: "/dashboard/supply", label: "Allocation Analytics", icon: SlidersHorizontal },
  { to: "/dashboard/demand", label: "Complaints", icon: LifeBuoy },
  { to: "/dashboard/status", label: "Emergency Control", icon: Siren },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function UserDashboardLayout() {
  if (typeof window !== "undefined") {
    const s = getSession();
    if (!s) return <Navigate to="/login" />;
    if (s.role !== "citizen" && s.role !== "user") return <Navigate to="/admin" />;
  }
  return (
    <DashboardLayout items={items} title="AquaResolve AI Citizen Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}

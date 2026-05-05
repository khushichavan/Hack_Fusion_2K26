import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Bell, Droplets, Gauge, ListChecks, Map, Send, Settings, User } from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/DashboardLayout";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  component: UserDashboardLayout,
});

const items: NavItem[] = [
  { to: "/dashboard", label: "Profile", icon: User },
  { to: "/dashboard/location", label: "Location View", icon: Map },
  { to: "/dashboard/supply", label: "Water Supply", icon: Droplets },
  { to: "/dashboard/demand", label: "Demand Request", icon: Send },
  { to: "/dashboard/status", label: "Request Status", icon: ListChecks },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function UserDashboardLayout() {
  if (typeof window !== "undefined") {
    const s = getSession();
    if (!s) return <Navigate to="/login" />;
    if (s.role !== "user") return <Navigate to="/admin" />;
  }
  return (
    <DashboardLayout items={items} title="User Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}

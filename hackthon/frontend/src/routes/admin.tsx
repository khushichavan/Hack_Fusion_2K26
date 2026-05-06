import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Droplets,
  Gauge,
  History,
  Inbox,
  PieChart,
  Settings,
  User,
} from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/DashboardLayout";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const items: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: Gauge },
  { to: "/admin/supply", label: "Water Map", icon: Droplets },
  { to: "/admin/allocation", label: "Allocation Analytics", icon: PieChart },
  { to: "/admin/requests", label: "Complaints", icon: Inbox },
  { to: "/admin/conflict", label: "Emergency Control", icon: AlertTriangle },
  { to: "/admin/logs", label: "Notifications", icon: History },
  { to: "/admin/settings", label: "Profile", icon: User },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  if (typeof window !== "undefined") {
    const s = getSession();
    if (!s) return <Navigate to="/login" />;
    if (s.role !== "admin" && s.role !== "authority") return <Navigate to="/dashboard" />;
  }
  return (
    <DashboardLayout items={items} title="AquaResolve AI Command Center">
      <Outlet />
    </DashboardLayout>
  );
}

import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { AlertTriangle, Droplets, FileSearch, Gauge, History, Inbox, PieChart, Settings, User } from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/DashboardLayout";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const items: NavItem[] = [
  { to: "/admin", label: "Profile", icon: User },
  { to: "/admin/supply", label: "Supply Management", icon: Droplets },
  { to: "/admin/demand", label: "Demand Management", icon: Gauge },
  { to: "/admin/allocation", label: "Allocation", icon: PieChart },
  { to: "/admin/conflict", label: "Conflict Resolution", icon: AlertTriangle },
  { to: "/admin/logs", label: "Audit Logs", icon: History },
  { to: "/admin/requests", label: "User Requests", icon: Inbox },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  if (typeof window !== "undefined") {
    const s = getSession();
    if (!s) return <Navigate to="/login" />;
    if (s.role !== "admin") return <Navigate to="/dashboard" />;
  }
  return (
    <DashboardLayout items={items} title="Admin Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}

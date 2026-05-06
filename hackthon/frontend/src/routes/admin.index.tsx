import { createFileRoute } from "@tanstack/react-router";
import { SmartCommandCenter } from "@/components/SmartCommandCenter";

export const Route = createFileRoute("/admin/")({
  component: AdminCommandCenter,
});

function AdminCommandCenter() {
  return <SmartCommandCenter mode="admin" />;
}

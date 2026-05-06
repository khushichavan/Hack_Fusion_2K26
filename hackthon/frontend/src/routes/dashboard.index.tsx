import { createFileRoute } from "@tanstack/react-router";
import { SmartCommandCenter } from "@/components/SmartCommandCenter";

export const Route = createFileRoute("/dashboard/")({
  component: CitizenDashboard,
});

function CitizenDashboard() {
  return <SmartCommandCenter mode="citizen" />;
}

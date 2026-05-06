import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard/supply")({
  component: SupplyPage,
});

function statusBadge(pct: number) {
  if (pct >= 90)
    return (
      <Badge className="bg-success text-success-foreground hover:bg-success">Full Supply</Badge>
    );
  if (pct >= 60)
    return (
      <Badge className="bg-warning text-warning-foreground hover:bg-warning">Partial Supply</Badge>
    );
  return <Badge variant="destructive">Low Supply</Badge>;
}

function SupplyPage() {
  const total = useStore((s) => s.totalSupply);
  const areas = useStore((s) => s.areas);
  const demand = areas.reduce((a, b) => a + b.demand, 0);
  const allocation = areas.reduce((a, b) => a + b.allocated, 0);
  const pct = demand ? Math.round((allocation / demand) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Total Supply" value={`${total} ML`} accent="primary" />
        <Stat title="Total Demand" value={`${demand} ML`} accent="warning" />
        <Stat title="Allocated" value={`${allocation} ML`} accent="success" />
        <Card className="p-6">
          <div className="mb-3 inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">
            Status
          </div>
          <div className="text-xl font-semibold">{statusBadge(pct)}</div>
        </Card>
      </div>
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Allocation coverage</h3>
          <span className="text-sm text-muted-foreground">{pct}% of demand met</span>
        </div>
        <Progress value={pct} />
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Demand vs allocation by area</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={areas}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 230)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand" fill="oklch(0.78 0.15 75)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="allocated" fill="oklch(0.55 0.15 230)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: "primary" | "warning" | "success";
}) {
  const cls =
    accent === "primary"
      ? "bg-primary/10 text-primary"
      : accent === "warning"
        ? "bg-warning/15 text-warning-foreground"
        : "bg-success/15 text-success";
  return (
    <Card className="p-6">
      <div className={`mb-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${cls}`}>
        {title}
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </Card>
  );
}

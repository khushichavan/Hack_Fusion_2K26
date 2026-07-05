import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/stat-card";
import { AreaStatusBadge } from "@/components/status-badges";
import {
  CHART_ALLOCATED_FILL,
  CHART_DEMAND_FILL,
  CHART_GRID_STROKE,
  CHART_PALETTE,
} from "@/lib/chart";

export const Route = createFileRoute("/admin/allocation")({
  component: AllocationDash,
});

function AllocationDash() {
  const total = useStore((s) => s.totalSupply);
  const areas = useStore((s) => s.areas);
  const requests = useStore((s) => s.requests);
  const totalDemand = areas.reduce((a, b) => a + b.demand, 0);
  const totalAlloc = areas.reduce((a, b) => a + b.allocated, 0);
  const pendingRequests = requests.filter((r) => r.status === "Pending" || r.status === "Active");
  const approvedRequests = requests.filter((r) => r.status === "Approved");
  const totalRequestAmount = requests.reduce((sum, r) => sum + r.amount, 0);
  const shortage = Math.max(0, totalDemand - total);
  const pie = areas.map((a) => ({ name: a.name, value: a.allocated }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Supply" value={`${total} ML`} />
        <StatCard title="Total Demand" value={`${totalDemand} ML`} />
        <StatCard title="Pending requests" value={`${pendingRequests.length}`} />
        <StatCard title="Request demand" value={`${totalRequestAmount} ML`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Allocation by area</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {pie.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Demand vs allocated</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={areas}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="demand" fill={CHART_DEMAND_FILL} radius={[6, 6, 0, 0]} />
                <Bar dataKey="allocated" fill={CHART_ALLOCATED_FILL} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="grid gap-4 md:grid-cols-3 p-6">
        <div className="rounded-3xl border border-border p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pending</div>
          <div className="mt-2 text-3xl font-bold">{pendingRequests.length}</div>
        </div>
        <div className="rounded-3xl border border-border p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Approved</div>
          <div className="mt-2 text-3xl font-bold">{approvedRequests.length}</div>
        </div>
        <div className="rounded-3xl border border-border p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Shortage</div>
          <div className="mt-2 text-3xl font-bold">{shortage} ML</div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Allocation table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Demand</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Justification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.category}</TableCell>
                <TableCell>{a.demand} ML</TableCell>
                <TableCell className="capitalize">{a.priority}</TableCell>
                <TableCell>{a.allocated} ML</TableCell>
                <TableCell>
                  <AreaStatusBadge status={a.status} />
                </TableCell>
                <TableCell className="max-w-xs text-xs text-muted-foreground">
                  {a.justification}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

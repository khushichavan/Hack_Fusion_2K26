import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/common/ChartCard";
import { CongestionBadge } from "@/components/common/CongestionBadge";
import { DynamicIcon } from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { HeatMap } from "@/components/charts/HeatMap";
import { useAsync } from "@/hooks/useAsync";
import { dashboardApi } from "@/services/mockApi";
import { alertTypeMeta, priorityMeta } from "@/lib/traffic";
import { formatDateTime } from "@/lib/utils";

export default function Dashboard() {
  const stats = useAsync(() => dashboardApi.getStats(), []);
  const trend = useAsync(() => dashboardApi.getTrend(), []);
  const vehicles = useAsync(() => dashboardApi.getVehicleCounts(), []);
  const heat = useAsync(() => dashboardApi.getHeatCells(), []);
  const recent = useAsync(() => dashboardApi.getRecentPredictions(), []);
  const activeAlerts = useAsync(() => dashboardApi.getAlerts(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time traffic intelligence across the city network."
        actions={
          <>
            <Button variant="outline" onClick={() => { stats.refetch(); trend.refetch(); toast.success("Dashboard refreshed"); }}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button asChild variant="gradient">
              <Link to="/app/prediction">
                <Sparkles className="h-4 w-4" /> New Prediction
              </Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.loading || !stats.data
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          : stats.data.map((stat, i) => (
              <StatCard key={stat.id} stat={stat} index={i} />
            ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Traffic Trend"
          description="Current vs predicted congestion over 24h"
        >
          {trend.loading || !trend.data ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend.data}>
                <defs>
                  <linearGradient id="curGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="current" name="Current %" stroke="#38bdf8" fill="url(#curGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="predicted" name="Predicted %" stroke="#a78bfa" fill="url(#predGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Congestion Prediction"
          description="AI-forecasted congestion index"
        >
          {trend.loading || !trend.data ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="predicted" name="Predicted %" stroke="#34d399" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Vehicle Count"
          description="Vehicle mix detected across sensors"
        >
          {vehicles.loading || !vehicles.data ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vehicles.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="cars" name="Cars" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bikes" name="Two-Wheelers" stackId="a" fill="#a78bfa" />
                <Bar dataKey="buses" name="Buses" stackId="a" fill="#34d399" />
                <Bar dataKey="trucks" name="Trucks" stackId="a" fill="#fbbf24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Congestion Heat Map"
          description="Intensity by zone and day of week"
        >
          {heat.loading || !heat.data ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <HeatMap cells={heat.data} />
          )}
        </ChartCard>
      </div>

      {/* Recent predictions + side column */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Predictions</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/history">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.loading || !recent.data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Congestion</TableHead>
                    <TableHead className="hidden sm:table-cell">ETA</TableHead>
                    <TableHead className="hidden md:table-cell">Confidence</TableHead>
                    <TableHead className="hidden lg:table-cell">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.route}</TableCell>
                      <TableCell>
                        <CongestionBadge level={p.congestion} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {p.travelTime} min
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.confidence}%
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDateTime(p.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Live status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wifi className="h-4 w-4 text-emerald-400" /> Live Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "AI Inference", value: "Operational", ok: true },
                { label: "Camera Network", value: "142 / 150 online", ok: true },
                { label: "Data Pipeline", value: "Streaming", ok: true },
                { label: "Prediction Model", value: "v4.2 · synced", ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    {s.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Active Alerts</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/alerts">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlerts.loading || !activeAlerts.data
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                : activeAlerts.data.slice(0, 4).map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                    >
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${priorityMeta[a.priority].hex}22`, color: priorityMeta[a.priority].hex }}
                      >
                        <DynamicIcon name={alertTypeMeta[a.type].icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{a.title}</p>
                          <Badge
                            variant={a.priority === "critical" || a.priority === "high" ? "destructive" : "warning"}
                            className="shrink-0"
                          >
                            {priorityMeta[a.priority].label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {a.location}
                          <span className="mx-1">·</span>
                          <Clock className="h-3 w-3" /> {formatDateTime(a.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

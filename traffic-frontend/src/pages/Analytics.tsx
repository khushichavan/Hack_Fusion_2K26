import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ChartCard } from "@/components/common/ChartCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAsync } from "@/hooks/useAsync";
import { analyticsApi } from "@/services/mockApi";

export default function Analytics() {
  const { data, loading } = useAsync(() => analyticsApi.getSummary(), []);
  const [range, setRange] = useState("daily");

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Traffic intelligence & trends." />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const rangeData = {
    daily: { data: data.dailyTraffic, key: "day", label: "Daily Traffic Volume" },
    weekly: { data: data.weeklyTraffic, key: "week", label: "Weekly Traffic Volume" },
    monthly: { data: data.monthlyTraffic, key: "month", label: "Monthly Volume (millions)" },
  }[range]!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep insights across traffic volume, speed and accuracy."
        actions={
          <Button variant="outline" onClick={() => toast.success("Report exported")}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
        }
      />

      <ChartCard
        title="Traffic Volume"
        description="Switch between daily, weekly and monthly aggregates"
        action={
          <Tabs value={range} onValueChange={setRange}>
            <TabsList className="h-9">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <Tabs value={range}>
          <TabsContent value={range} className="mt-0">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={rangeData.data}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={rangeData.key} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="volume" name={rangeData.label} stroke="#38bdf8" fill="url(#volGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Peak Hours" description="Congestion intensity by hour">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} unit=":00" />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <RTooltip content={<ChartTooltip />} />
              <Bar dataKey="intensity" name="Intensity" radius={[6, 6, 0, 0]}>
                {data.peakHours.map((h, i) => (
                  <Cell
                    key={i}
                    fill={h.intensity > 80 ? "#f87171" : h.intensity > 60 ? "#fb923c" : h.intensity > 40 ? "#fbbf24" : "#34d399"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Speed by Zone" description="km/h across city zones">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data.averageSpeed}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="zone" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <RTooltip content={<ChartTooltip />} />
              <Radar name="Avg Speed" dataKey="speed" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vehicle Distribution" description="Detected vehicle mix">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.vehicleDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {data.vehicleDistribution.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="transparent" />
                ))}
              </Pie>
              <RTooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
            {data.vehicleDistribution.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value}%)
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Prediction Accuracy" description="Model accuracy over the week">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.predictionAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis domain={[80, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
              <RTooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Congestion Frequency" description="Occurrences by severity level">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.congestionFrequency} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis type="category" dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
            <RTooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Occurrences" radius={[0, 6, 6, 0]}>
              {data.congestionFrequency.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, BrainCircuit, RadioTower, ShieldCheck, Truck, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  apiPlatformSnapshot,
  apiRunFairness,
  apiTriggerEmergency,
  type PlatformSnapshot,
} from "@/lib/api";
import { toast } from "sonner";

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001").replace(
  /^http/,
  "ws",
);

const fallback: PlatformSnapshot = {
  platform: "AquaResolve AI",
  database: "local-demo",
  zones: [
    {
      id: "zone-a",
      name: "Central Hospital District",
      lat: 28.6208,
      lng: 77.2167,
      population: 128000,
      hospitals: 4,
      demand_factor: 0.92,
      wastage: 0.08,
      low_income_index: 0.16,
      past_usage: 0.72,
      tank_level: 0.95,
      leakage_alert: false,
      status: "balanced",
    },
    {
      id: "zone-c",
      name: "Riverside Low Income Belt",
      lat: 28.6392,
      lng: 77.1898,
      population: 185000,
      hospitals: 1,
      demand_factor: 0.88,
      wastage: 0.21,
      low_income_index: 0.62,
      past_usage: 0.82,
      tank_level: 0.54,
      leakage_alert: false,
      status: "warning",
    },
    {
      id: "zone-e",
      name: "Old Town Fire Corridor",
      lat: 28.6501,
      lng: 77.2288,
      population: 98000,
      hospitals: 2,
      demand_factor: 0.96,
      wastage: 0.17,
      low_income_index: 0.44,
      past_usage: 0.77,
      tank_level: 0.38,
      leakage_alert: true,
      status: "critical",
    },
  ],
  latest_allocation: {
    total_supply: 1850,
    city_fairness_score: 86.4,
    allocations: [
      {
        zone_id: "zone-a",
        zone: "Central Hospital District",
        allocation_ml: 520,
        demand_ml: 455,
        fairness_score: 93,
        status: "balanced",
        explanation:
          "Central Hospital District received priority allocation because hospital demand increased.",
      },
      {
        zone_id: "zone-c",
        zone: "Riverside Low Income Belt",
        allocation_ml: 480,
        demand_ml: 530,
        fairness_score: 81,
        status: "warning",
        explanation:
          "Riverside received equity-weighted water because low-income vulnerability is high.",
      },
      {
        zone_id: "zone-e",
        zone: "Old Town Fire Corridor",
        allocation_ml: 360,
        demand_ml: 410,
        fairness_score: 74,
        status: "critical",
        explanation: "Old Town needs emergency redistribution because tank level is critical.",
      },
    ],
  },
  analytics: {
    total_supply: 1850,
    city_fairness_score: 86.4,
    critical_zones: 1,
    open_complaints: 3,
    active_requests: 5,
    tankers_active: 2,
  },
  predictions: [
    { day: "Mon", demand: 1240, predicted: 1310 },
    { day: "Tue", demand: 1380, predicted: 1435 },
    { day: "Wed", demand: 1515, predicted: 1580 },
    { day: "Thu", demand: 1480, predicted: 1620 },
    { day: "Fri", demand: 1660, predicted: 1725 },
    { day: "Sat", demand: 1585, predicted: 1680 },
  ],
  tankers: [
    {
      id: "tanker-01",
      driver: "R. Kumar",
      lat: 28.612,
      lng: 77.211,
      capacity: 24,
      status: "en route",
      zone_id: "zone-e",
    },
  ],
  complaints: [],
  notifications: [],
  audit_logs: [],
  emergency_events: [],
};

export function SmartCommandCenter({ mode }: { mode: "admin" | "citizen" }) {
  const [snapshot, setSnapshot] = useState<PlatformSnapshot>(fallback);
  const [loading, setLoading] = useState(true);
  const isAdmin = mode === "admin";

  useEffect(() => {
    let mounted = true;
    apiPlatformSnapshot()
      .then((data) => mounted && setSnapshot(data))
      .catch(() => toast.error("Using local demo data because backend snapshot is unavailable"))
      .finally(() => mounted && setLoading(false));

    const ws = new WebSocket(`${WS_BASE_URL}/ws`);
    ws.onmessage = (event) => {
      let message: { event?: string; payload?: PlatformSnapshot };
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        console.error("Failed to parse websocket message", error);
        return;
      }
      if (message.event === "snapshot" && message.payload) setSnapshot(message.payload);
      if (message.event?.includes("allocation") || message.event?.includes("emergency")) {
        apiPlatformSnapshot()
          .then(setSnapshot)
          .catch((error) => console.error("Failed to refresh snapshot after update", error));
      }
    };
    ws.onerror = (event) => console.error("Command center websocket error", event);
    return () => {
      mounted = false;
      ws.close();
    };
  }, []);

  const allocationChart = useMemo(
    () =>
      snapshot.latest_allocation.allocations.map((item) => ({
        zone: item.zone.replace(" District", "").replace(" Belt", ""),
        allocation: item.allocation_ml,
        demand: item.demand_ml,
        score: item.fairness_score,
      })),
    [snapshot],
  );

  const runAI = async () => {
    try {
      const result = await apiRunFairness({
        total_supply: snapshot.analytics.total_supply,
        drought_severity: 0.42,
      });
      toast.success(result.message);
      const data = await apiPlatformSnapshot();
      setSnapshot(data);
    } catch (error) {
      console.error("Failed to run AI fairness engine", error);
      toast.error("Could not run the AI fairness engine. Is the backend running?");
    }
  };

  const triggerEmergency = async () => {
    try {
      const zone = snapshot.zones.find((item) => item.status === "critical") ?? snapshot.zones[0];
      const result = await apiTriggerEmergency({
        event_type: "hospital emergency",
        zone_id: zone.id,
        severity: "critical",
        notes: "Automatic redistribution from command center",
      });
      toast.success(result.message);
      const data = await apiPlatformSnapshot();
      setSnapshot(data);
    } catch (error) {
      console.error("Failed to trigger emergency redistribution", error);
      toast.error("Could not trigger emergency redistribution. Is the backend running?");
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border bg-card/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 bg-primary/15 text-primary hover:bg-primary/15">
              {loading ? "Synchronizing" : "Live"} | {snapshot.database}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              AquaResolve AI - Fair Urban Water Distribution System
            </h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              AI-powered smart city command center for fair allocation, emergency redistribution,
              transparent explanations, real-time water analytics, and citizen response.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runAI}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Run AI fairness engine
            </Button>
            {isAdmin && (
              <Button variant="destructive" onClick={triggerEmergency}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Trigger emergency mode
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Waves}
          label="Total supply"
          value={`${snapshot.analytics.total_supply} ML`}
          tone="cyan"
        />
        <Metric
          icon={ShieldCheck}
          label="AI fairness score"
          value={`${snapshot.analytics.city_fairness_score}%`}
          tone="green"
        />
        <Metric
          icon={AlertTriangle}
          label="Critical zones"
          value={snapshot.analytics.critical_zones}
          tone="red"
        />
        <Metric
          icon={Truck}
          label="Tankers active"
          value={snapshot.analytics.tankers_active}
          tone="yellow"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Live City Water Map</h3>
              <p className="text-sm text-muted-foreground">
                Green balanced, yellow warning, red critical shortage.
              </p>
            </div>
            <RadioTower className="h-5 w-5 text-primary" />
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-lg border bg-[linear-gradient(135deg,rgba(10,48,66,0.95),rgba(18,82,92,0.8)),url('/src/assets/hero-water.jpg')] bg-cover">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:36px_36px]" />
            {snapshot.zones.map((zone, index) => (
              <div
                key={zone.id}
                className="absolute min-w-40 rounded-lg border border-white/20 bg-black/35 p-3 text-white shadow-xl backdrop-blur"
                style={{
                  left: `${12 + (index % 3) * 30}%`,
                  top: `${18 + Math.floor(index / 3) * 38}%`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${zoneColor(zone.status)}`} />
                  <span className="text-sm font-semibold">{zone.name}</span>
                </div>
                <div className="mt-2 text-xs text-white/75">
                  Tank {Math.round(zone.tank_level * 100)}% | Demand{" "}
                  {Math.round(zone.demand_factor * 100)}%
                </div>
                {zone.leakage_alert && (
                  <Badge className="mt-2 bg-red-500 text-white hover:bg-red-500">
                    Leakage alert
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">AI Demand Prediction</h3>
          <p className="text-sm text-muted-foreground">
            ML-style forecast from demand, weather, drought, and past usage.
          </p>
          <div className="mt-5 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.predictions}>
                <defs>
                  <linearGradient id="demandFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--color-primary)"
                  fill="url(#demandFill)"
                />
                <Line type="monotone" dataKey="demand" stroke="var(--color-success)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold">Allocation Analytics</h3>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="demand" fill="var(--color-warning)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="allocation" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">Explainable AI Decisions</h3>
          <div className="mt-5 space-y-3">
            {snapshot.latest_allocation.allocations.slice(0, 5).map((item) => (
              <div key={item.zone_id} className="rounded-lg border bg-muted/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{item.zone}</div>
                  <Badge className={badgeClass(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.explanation}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  {item.allocation_ml} ML allocated | fairness {item.fairness_score}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function zoneColor(status: string) {
  if (status === "critical") return "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,.9)]";
  if (status === "warning") return "bg-yellow-400 shadow-[0_0_18px_rgba(250,204,21,.9)]";
  return "bg-green-500 shadow-[0_0_18px_rgba(34,197,94,.9)]";
}

function badgeClass(status: string) {
  if (status === "critical") return "bg-red-500 text-white hover:bg-red-500";
  if (status === "warning") return "bg-yellow-400 text-yellow-950 hover:bg-yellow-400";
  return "bg-green-500 text-white hover:bg-green-500";
}

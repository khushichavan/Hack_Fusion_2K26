import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  Clock,
  Gauge,
  Lightbulb,
  MapPin,
  Navigation,
  Route,
  Sparkles,
  TimerReset,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CongestionBadge } from "@/components/common/CongestionBadge";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { predictionApi } from "@/services/mockApi";
import { congestionMeta } from "@/lib/traffic";
import {
  eventOptions,
  locationOptions,
  vehicleTypeOptions,
  weatherOptions,
} from "@/data/mockData";
import type { PredictionResult } from "@/types";

const schema = z.object({
  source: z.string().min(1, "Select a source"),
  destination: z.string().min(1, "Select a destination"),
  date: z.string().min(1, "Pick a date"),
  time: z.string().min(1, "Pick a time"),
  weather: z.string().min(1),
  event: z.string().min(1),
  vehicleType: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

const today = new Date().toISOString().split("T")[0];

export default function Prediction() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      source: "MG Road",
      destination: "Airport",
      date: today,
      time: "18:00",
      weather: "Clear",
      event: "None",
      vehicleType: "Car",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (values.source === values.destination) {
      toast.error("Source and destination must differ");
      return;
    }
    const res = await predictionApi.run(values);
    setResult(res);
    toast.success("Prediction ready", {
      description: `${congestionMeta[res.congestion].label} congestion · ${res.confidence}% confidence`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Prediction"
        description="Configure your trip and let the AI forecast congestion."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Route className="h-4 w-4 text-primary" /> Trip Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <SelectField
                control={control}
                name="source"
                label="Source"
                icon={<MapPin className="h-4 w-4" />}
                options={locationOptions}
                error={errors.source?.message}
              />
              <SelectField
                control={control}
                name="destination"
                label="Destination"
                icon={<Navigation className="h-4 w-4" />}
                options={locationOptions}
                error={errors.destination?.message}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="date" type="date" className="pl-9" {...register("date")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="time" type="time" className="pl-9" {...register("time")} />
                  </div>
                </div>
              </div>
              <SelectField
                control={control}
                name="weather"
                label="Weather"
                options={weatherOptions}
              />
              <SelectField
                control={control}
                name="event"
                label="Event"
                options={eventOptions}
              />
              <SelectField
                control={control}
                name="vehicleType"
                label="Vehicle Type"
                options={vehicleTypeOptions}
              />
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size={18} className="text-white" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isSubmitting ? "Analysing…" : "Run Prediction"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          {isSubmitting ? (
            <PredictionLoading />
          ) : result ? (
            <PredictionResults result={result} />
          ) : (
            <EmptyPrediction />
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  control,
  name,
  label,
  options,
  icon,
  error,
}: {
  control: any;
  name: keyof FormValues;
  label: string;
  options: string[];
  icon?: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <span className="flex items-center gap-2">
                {icon}
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </span>
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function EmptyPrediction() {
  return (
    <Card className="flex h-full min-h-[400px] items-center justify-center">
      <div className="max-w-sm p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 text-primary">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Ready to predict</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in your trip details and run the AI model to see forecasted
          congestion, travel time and smart route recommendations.
        </p>
      </div>
    </Card>
  );
}

function PredictionLoading() {
  return (
    <Card className="flex h-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
          <LoadingSpinner size={40} />
        </div>
        <p className="font-medium">AI model analysing your route…</p>
        <p className="text-sm text-muted-foreground">
          Crunching traffic patterns, weather & events
        </p>
      </div>
    </Card>
  );
}

function PredictionResults({ result }: { result: PredictionResult }) {
  const metrics = [
    {
      icon: TrendingUp,
      label: "Estimated Traffic",
      value: `${result.estimatedTraffic}%`,
      accent: "from-sky-500/20 to-cyan-500/10",
    },
    {
      icon: TimerReset,
      label: "Travel Time",
      value: `${result.travelTime} min`,
      accent: "from-violet-500/20 to-fuchsia-500/10",
    },
    {
      icon: Gauge,
      label: "Avg Speed",
      value: `${result.averageSpeed} km/h`,
      accent: "from-emerald-500/20 to-teal-500/10",
    },
    {
      icon: Route,
      label: "Distance",
      value: `${result.distance} km`,
      accent: "from-amber-500/20 to-orange-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className={`bg-gradient-to-br p-4 ${m.accent}`}>
              <m.icon className="h-5 w-5 text-foreground/80" />
              <p className="mt-3 text-xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Congestion Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={result.timeline}>
                <defs>
                  <linearGradient id="predArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={congestionMeta[result.congestion].hex} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={congestionMeta[result.congestion].hex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="congestion"
                  name="Congestion %"
                  stroke={congestionMeta[result.congestion].hex}
                  fill="url(#predArea)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prediction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Congestion Level</span>
              <CongestionBadge level={result.congestion} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className="font-semibold">{result.confidence}%</span>
              </div>
              <Progress value={result.confidence} indicatorClassName="bg-gradient-to-r from-sky-500 to-violet-500" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Risk Score</span>
                <span className="font-semibold">{result.riskScore}/100</span>
              </div>
              <Progress
                value={result.riskScore}
                indicatorClassName={
                  result.riskScore > 75
                    ? "bg-red-500"
                    : result.riskScore > 55
                      ? "bg-orange-500"
                      : result.riskScore > 35
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                }
              />
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <Route className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Suggested alternate route</p>
                <p className="text-sm font-medium">{result.alternateRoute}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="flex items-start gap-4 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">AI Recommendation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.recommendation}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

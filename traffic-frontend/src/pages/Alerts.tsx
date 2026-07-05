import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, Clock, MapPin, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DynamicIcon } from "@/components/common/Icon";
import { useAsync } from "@/hooks/useAsync";
import { alertApi } from "@/services/mockApi";
import { alertTypeMeta, priorityMeta } from "@/lib/traffic";
import { formatDateTime } from "@/lib/utils";
import type { Alert, AlertPriority, AlertType } from "@/types";

const typeFilters: (AlertType | "all")[] = [
  "all",
  "accident",
  "roadblock",
  "weather",
  "emergency",
  "construction",
];

export default function Alerts() {
  const { data, loading } = useAsync(() => alertApi.list(), []);
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  const list = useMemo(() => alerts ?? data ?? [], [alerts, data]);

  const filtered = useMemo(
    () =>
      list.filter(
        (a) =>
          (typeFilter === "all" || a.type === typeFilter) &&
          (showResolved || !a.resolved),
      ),
    [list, typeFilter, showResolved],
  );

  const resolve = (id: string) => {
    setAlerts((list ?? data ?? []).map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    toast.success("Alert marked as resolved");
  };

  const counts = useMemo(() => {
    const byPriority: Record<AlertPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    list.filter((a) => !a.resolved).forEach((a) => (byPriority[a.priority] += 1));
    return byPriority;
  }, [list]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Center"
        description="Real-time incidents prioritised by severity."
        actions={
          <Button
            variant="outline"
            onClick={() => setShowResolved((s) => !s)}
          >
            {showResolved ? "Hide" : "Show"} resolved
          </Button>
        }
      />

      {/* Priority summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(Object.keys(counts) as AlertPriority[]).map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {priorityMeta[p].label}
                  </p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: priorityMeta[p].hex }}>
                    {counts[p]}
                  </p>
                </div>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${priorityMeta[p].hex}22`, color: priorityMeta[p].hex }}
                >
                  <ShieldAlert className="h-5 w-5" />
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Alerts list */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={typeFilter === f ? "gradient" : "outline"}
                onClick={() => setTypeFilter(f)}
                className="capitalize"
              >
                {f === "all" ? "All" : alertTypeMeta[f as AlertType].label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No alerts"
              description="There are no alerts matching the current filters."
              icon={<BellRing className="h-6 w-6" />}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className="overflow-hidden border-l-4"
                    style={{ borderLeftColor: priorityMeta[a.priority].hex }}
                  >
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${priorityMeta[a.priority].hex}22`, color: priorityMeta[a.priority].hex }}
                      >
                        <DynamicIcon name={alertTypeMeta[a.type].icon} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{a.title}</p>
                          <Badge
                            variant={
                              a.priority === "critical" || a.priority === "high"
                                ? "destructive"
                                : a.priority === "medium"
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {priorityMeta[a.priority].label}
                          </Badge>
                          <Badge variant="secondary">
                            {alertTypeMeta[a.type].label}
                          </Badge>
                          {a.resolved && <Badge variant="success">Resolved</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {a.description}
                        </p>
                        <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {a.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDateTime(a.timestamp)}
                          </span>
                        </p>
                      </div>
                      {!a.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolve(a.id)}
                          className="shrink-0"
                        >
                          <Check className="h-3.5 w-3.5" /> Resolve
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Notification panel */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-primary" /> Notification Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {list.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-white/5 p-2.5"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: priorityMeta[a.priority].hex }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.location}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

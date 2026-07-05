import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cctv,
  MapPin,
  RefreshCw,
  Signal,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CongestionBadge } from "@/components/common/CongestionBadge";
import { useAsync } from "@/hooks/useAsync";
import { cameraApi } from "@/services/mockApi";
import { formatNumber } from "@/lib/utils";
import type { Camera } from "@/types";

const statusMeta: Record<
  Camera["status"],
  { label: string; variant: "success" | "destructive" | "warning"; icon: typeof Video }
> = {
  online: { label: "Online", variant: "success", icon: Video },
  offline: { label: "Offline", variant: "destructive", icon: VideoOff },
  maintenance: { label: "Maintenance", variant: "warning", icon: Signal },
};

export default function Cameras() {
  const { data, loading, refetch } = useAsync(() => cameraApi.list(), []);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Camera["status"]>("all");

  const cameras = (data ?? []).filter(
    (c) => filter === "all" || c.status === filter,
  );
  const online = (data ?? []).filter((c) => c.status === "online").length;

  const handleRefresh = async (id: string) => {
    setRefreshing(id);
    await cameraApi.refresh(id);
    setRefreshing(null);
    toast.success("Camera feed refreshed");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Camera Monitoring"
        description={`${online} of ${data?.length ?? 0} cameras streaming live`}
        actions={
          <Button variant="outline" onClick={() => { refetch(); toast.success("All feeds refreshed"); }}>
            <RefreshCw className="h-4 w-4" /> Refresh All
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(["all", "online", "offline", "maintenance"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "gradient" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cameras.map((cam, i) => {
            const status = statusMeta[cam.status];
            return (
              <motion.div
                key={cam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    {cam.status === "online" ? (
                      <img
                        src={cam.thumbnail}
                        alt={cam.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
                        <VideoOff className="h-8 w-8" />
                        <span className="text-xs">Feed unavailable</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {cam.status === "online" && (
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        LIVE · {cam.fps} FPS
                      </span>
                    )}
                    <Badge variant={status.variant} className="absolute right-3 top-3">
                      <status.icon className="h-3 w-3" /> {status.label}
                    </Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="flex items-center gap-1 text-sm font-semibold text-white">
                        <Cctv className="h-3.5 w-3.5" /> {cam.name}
                      </p>
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {cam.location}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Density</span>
                      <CongestionBadge level={cam.density} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vehicles</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        {formatNumber(cam.vehicleCount)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] p-2.5 text-xs">
                      <span className="text-muted-foreground">AI Detection: </span>
                      <span className="font-medium">{cam.detection}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={refreshing === cam.id || cam.status !== "online"}
                      onClick={() => handleRefresh(cam.id)}
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${refreshing === cam.id ? "animate-spin" : ""}`}
                      />
                      {refreshing === cam.id ? "Refreshing…" : "Refresh Feed"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

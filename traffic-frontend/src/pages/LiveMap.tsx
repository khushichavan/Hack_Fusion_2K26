import { useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { motion } from "framer-motion";
import {
  Crosshair,
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMarkerIcon, createUserIcon } from "@/components/map/mapIcons";
import { useAsync } from "@/hooks/useAsync";
import { mapApi } from "@/services/mockApi";
import { CITY_CENTER } from "@/data/mockData";
import { congestionMeta } from "@/lib/traffic";
import { cn } from "@/lib/utils";
import type { CongestionLevel, MapMarker, MapMarkerType } from "@/types";

const markerTypeMeta: Record<MapMarkerType, { label: string; color: string }> = {
  traffic: { label: "Traffic", color: "#38bdf8" },
  congestion: { label: "Congestion", color: "#fb923c" },
  camera: { label: "Camera", color: "#a78bfa" },
  accident: { label: "Accident", color: "#f87171" },
  construction: { label: "Construction", color: "#fbbf24" },
  emergency: { label: "Emergency", color: "#22d3ee" },
};

function MapController({
  target,
  onReady,
}: {
  target: [number, number] | null;
  onReady: (map: LeafletMap) => void;
}) {
  const map = useMap();
  onReady(map);
  if (target) {
    map.flyTo(target, 15, { duration: 1.2 });
  }
  return null;
}

export default function LiveMap() {
  const markers = useAsync(() => mapApi.getMarkers(), []);
  const routes = useAsync(() => mapApi.getRoutes(), []);
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<MapMarkerType[]>([
    "traffic",
    "congestion",
    "camera",
    "accident",
    "construction",
    "emergency",
  ]);
  const [target, setTarget] = useState<[number, number] | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(
    () =>
      (markers.data ?? []).filter(
        (m) =>
          activeTypes.includes(m.type) &&
          (query === "" ||
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase())),
      ),
    [markers.data, activeTypes, query],
  );

  const toggleType = (type: MapMarkerType) =>
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const locateUser = () => {
    if (!navigator.geolocation) {
      const fallback: [number, number] = [
        CITY_CENTER[0] + 0.01,
        CITY_CENTER[1] - 0.01,
      ];
      setUserPos(fallback);
      setTarget(fallback);
      toast.info("Using approximate location");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        setTarget(p);
        toast.success("Location found");
      },
      () => {
        const fallback: [number, number] = [
          CITY_CENTER[0] + 0.01,
          CITY_CENTER[1] - 0.01,
        ];
        setUserPos(fallback);
        setTarget(fallback);
        toast.info("Location unavailable — showing city center");
      },
    );
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
    setTimeout(() => mapRef.current?.invalidateSize(), 250);
  };

  const searchResults = query
    ? (markers.data ?? []).filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Map"
        description="Live traffic, incidents, cameras and route intelligence."
        actions={
          <Button variant="outline" onClick={locateUser}>
            <Crosshair className="h-4 w-4" /> My Location
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Controls */}
        <div className="space-y-4 lg:order-1">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search location…"
                  className="h-11 w-full rounded-lg border border-input bg-background/50 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setTarget(m.position);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                    >
                      <Navigation className="h-3.5 w-3.5 text-primary" />
                      {m.title}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4" /> Map Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {(Object.keys(markerTypeMeta) as MapMarkerType[]).map((type) => {
                const active = activeTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all",
                      active
                        ? "border-white/10 bg-white/5 text-foreground"
                        : "border-transparent text-muted-foreground opacity-50",
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: markerTypeMeta[type].color }}
                    />
                    {markerTypeMeta[type].label}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Route Congestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(routes.data ?? []).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRoute((prev) => (prev === r.id ? null : r.id));
                    setTarget(r.path[0]);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                    selectedRoute === r.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/5 hover:bg-white/[0.03]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-6 rounded-full"
                      style={{ backgroundColor: congestionMeta[r.level].hex }}
                    />
                    <span className="truncate">{r.name}</span>
                  </div>
                  <Badge variant={r.level as CongestionLevel}>{r.speed} km/h</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap gap-3 p-4 text-xs text-muted-foreground">
              {(Object.keys(congestionMeta) as CongestionLevel[]).map((lvl) => (
                <span key={lvl} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: congestionMeta[lvl].hex }}
                  />
                  {congestionMeta[lvl].label}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-card"
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="absolute right-3 top-3 z-[1000] shadow-lg"
            aria-label="Toggle fullscreen"
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <MapContainer
            center={CITY_CENTER}
            zoom={12}
            className="h-[70vh] min-h-[520px] w-full"
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController
              target={target}
              onReady={(m) => (mapRef.current = m)}
            />

            {(routes.data ?? []).map((r) => (
              <Polyline
                key={r.id}
                positions={r.path}
                pathOptions={{
                  color: congestionMeta[r.level].hex,
                  weight: selectedRoute === r.id ? 8 : 5,
                  opacity: selectedRoute && selectedRoute !== r.id ? 0.35 : 0.9,
                }}
              >
                <Popup>
                  <div className="p-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {congestionMeta[r.level].label} · {r.speed} km/h · +{r.delay}{" "}
                      min delay
                    </p>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {filtered.map((m) => (
              <Marker
                key={m.id}
                position={m.position}
                icon={createMarkerIcon(m.type)}
              >
                <MarkerPopup marker={m} />
              </Marker>
            ))}

            {userPos && (
              <Marker position={userPos} icon={createUserIcon()}>
                <Popup>
                  <div className="p-3">
                    <p className="font-semibold">Your location</p>
                    <p className="text-xs text-muted-foreground">
                      {userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

function MarkerPopup({ marker }: { marker: MapMarker }) {
  return (
    <Popup>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-56 p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-foreground">{marker.title}</p>
          {marker.level && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: `${congestionMeta[marker.level].hex}22`,
                color: congestionMeta[marker.level].hex,
              }}
            >
              {congestionMeta[marker.level].label}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{marker.description}</p>
        {marker.extra && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-2">
            {Object.entries(marker.extra).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Popup>
  );
}

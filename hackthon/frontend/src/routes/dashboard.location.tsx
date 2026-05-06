import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getSession, saveUserLocation, useStore, type LocationDetails } from "@/lib/store";
import type { Map as LeafletMap, Marker } from "leaflet";

export const Route = createFileRoute("/dashboard/location")({
  component: LocationPage,
});

const defaultCenter: [number, number] = [28.6139, 77.209];
const gpsLocationLabel = "My current location";
const gpsCityLabel = "Live GPS";
const gpsPincodeLabel = "Device location";

function LocationPage() {
  const session = getSession();
  const user = useStore((s) => s.users.find((u) => u.email === session?.email));
  const savedLocation = user?.savedLocation;
  const [manual, setManual] = useState<LocationDetails>({
    area: savedLocation?.area ?? "",
    city: savedLocation?.city ?? "",
    pincode: savedLocation?.pincode ?? "",
    lat: savedLocation?.lat,
    lng: savedLocation?.lng,
  });
  const [coords, setCoords] = useState<[number, number]>(
    savedLocation?.lat !== undefined && savedLocation?.lng !== undefined
      ? [savedLocation.lat, savedLocation.lng]
      : defaultCenter,
  );
  const [markerText, setMarkerText] = useState("Your water request location");
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Waiting for device location");
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const lastSavedCoordsRef = useRef<[number, number] | null>(
    savedLocation?.lat !== undefined && savedLocation?.lng !== undefined
      ? [savedLocation.lat, savedLocation.lng]
      : null,
  );

  useEffect(() => {
    if (savedLocation?.lat !== undefined && savedLocation?.lng !== undefined) {
      setCoords([savedLocation.lat, savedLocation.lng]);
      setMarkerText("Your water request location");
      setLocationStatus("Saved location loaded");
    }
  }, [savedLocation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !mapRef.current) return;
      if (leafletMapRef.current) return;
      const map = L.map(mapRef.current).setView(coords, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:50%;background:oklch(0.55 0.15 230);box-shadow:0 0 0 6px color-mix(in oklab, oklch(0.55 0.15 230) 30%, transparent);"></div>`,
      });
      const marker = L.marker(coords, { icon }).addTo(map);
      marker.bindPopup(markerText).openPopup();
      markerRef.current = marker;
      leafletMapRef.current = map;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, []);

  const updateMapMarker = (c: [number, number], text: string) => {
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView(c, 14);
      markerRef.current.setLatLng(c).bindPopup(text).openPopup();
    }
  };

  const saveGpsLocation = (c: [number, number]) => {
    const nextLocation: LocationDetails = {
      area: gpsLocationLabel,
      city: gpsCityLabel,
      pincode: gpsPincodeLabel,
      lat: c[0],
      lng: c[1],
    };
    setCoords(c);
    setMarkerText("Your water request location");
    setManual(nextLocation);
    if (user) {
      saveUserLocation(user.email, nextLocation);
      lastSavedCoordsRef.current = c;
    }
    updateMapMarker(c, "Your water request location");
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setIsLocating(true);
    setLocationStatus("Requesting GPS permission");
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const last = lastSavedCoordsRef.current;
        const movedEnough =
          !last || Math.abs(last[0] - c[0]) > 0.00005 || Math.abs(last[1] - c[1]) > 0.00005;
        if (movedEnough) {
          saveGpsLocation(c);
        }
        setIsLocating(false);
        setLocationStatus(`Live GPS active (${pos.coords.accuracy.toFixed(0)}m accuracy)`);
      },
      (error) => {
        setIsLocating(false);
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied"
            : "Unable to retrieve location";
        setLocationStatus(message);
        toast.error(message);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
  };

  useEffect(() => {
    handleUseMyLocation();
    // Start the GPS watcher once when the map page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveManualLocation = () => {
    if (!manual.area || !manual.city || !manual.pincode) {
      return toast.error("Please enter area, city and pincode");
    }
    const saved: LocationDetails = {
      area: manual.area,
      city: manual.city,
      pincode: manual.pincode,
      lat: coords[0],
      lng: coords[1],
    };
    if (user) saveUserLocation(user.email, saved);
    setMarkerText("Your water request location");
    updateMapMarker(coords, "Your water request location");
    toast.success("Location saved successfully");
  };

  const hasSaved = Boolean(savedLocation);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Location setup</div>
              <h2 className="text-xl font-semibold">Save your water request location</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleUseMyLocation} disabled={isLocating}>
              {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Use My Current Location
            </Button>
            <Button variant="outline" onClick={saveManualLocation}>
              Save Manual Location
            </Button>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">{locationStatus}</div>
      </Card>

      <Card className="grid gap-6 lg:grid-cols-[1.4fr_1fr] p-6">
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-muted/40 p-6">
            <div className="text-sm font-medium text-muted-foreground">Manual location entry</div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Area / Locality</Label>
                <Input
                  value={manual.area}
                  onChange={(e) => setManual({ ...manual, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={manual.city}
                  onChange={(e) => setManual({ ...manual, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={manual.pincode}
                  onChange={(e) => setManual({ ...manual, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Saved location
                </div>
                <div className="text-lg font-semibold mt-2">
                  {hasSaved ? savedLocation?.area : "No saved location"}
                </div>
              </div>
            </div>
            {hasSaved ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">City:</span> {savedLocation?.city}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Pincode:</span>{" "}
                  {savedLocation?.pincode}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Coordinates:</span>{" "}
                  {savedLocation?.lat?.toFixed(5) ?? "N/A"},{" "}
                  {savedLocation?.lng?.toFixed(5) ?? "N/A"}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Save a location with GPS or manual entry to enable demand requests.
              </p>
            )}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div ref={mapRef} className="h-[520px] w-full" />
        </Card>
      </Card>
    </div>
  );
}

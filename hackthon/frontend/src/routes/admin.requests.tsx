import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setState, useStore, addLog, notify, sweepExpired, createCombinedSupplyPlan, type DemandRequest, type RequestStatus } from "@/lib/store";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/requests")({
  component: UserRequestsPage,
});

function fmt(ms: number) {
  if (ms <= 0) return "—";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function statusBadge(s: RequestStatus) {
  const m: Record<RequestStatus, string> = {
    Pending: "bg-warning text-warning-foreground hover:bg-warning",
    Active: "bg-primary text-primary-foreground hover:bg-primary",
    Approved: "bg-success text-success-foreground hover:bg-success",
    Rejected: "bg-destructive text-destructive-foreground hover:bg-destructive",
    Completed: "bg-success text-success-foreground hover:bg-success",
    Expired: "bg-muted text-muted-foreground hover:bg-muted",
  };
  return <Badge className={m[s]}>{s}</Badge>;
}

function requestCenter(request: DemandRequest): [number, number] {
  if (request.coordinates) return [request.coordinates.lat, request.coordinates.lng];
  if (request.location.lat !== undefined && request.location.lng !== undefined) return [request.location.lat, request.location.lng];
  return [28.6139, 77.209];
}

function requestCoordinateLabel(request: DemandRequest) {
  const center = requestCenter(request);
  const hasGps = Boolean(request.coordinates || (request.location.lat !== undefined && request.location.lng !== undefined));
  return hasGps ? `${center[0].toFixed(5)}, ${center[1].toFixed(5)}` : "No GPS saved";
}

function UserRequestsPage() {
  const requests = useStore((s) => s.requests);
  const combinedPlans = useStore((s) => s.combinedPlans);
  const [now, setNow] = useState(Date.now());
  const [selectedRequest, setSelectedRequest] = useState<DemandRequest | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const modalMapRef = useRef<HTMLDivElement>(null);
  const modalMapInstance = useRef<any>(null);
  const modalMarkerRef = useRef<any>(null);

  useEffect(() => {
    const t = setInterval(() => { sweepExpired(); setNow(Date.now()); }, 1000);
    return () => clearInterval(t);
  }, []);

  const groups = useMemo(() => {
    const map: Record<string, DemandRequest[]> = {};
    requests.forEach((r) => {
      const key = r.location.area.trim() || "Unknown area";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map)
      .map(([area, list]) => ({ area, requests: list, totalAmount: list.reduce((sum, req) => sum + req.amount, 0) }))
      .filter((group) => group.requests.length > 1)
      .sort((a, b) => b.requests.length - a.requests.length);
  }, [requests]);

  useEffect(() => {
    if (!mapOpen || !selectedRequest || !modalMapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !modalMapRef.current) return;
      if (modalMapInstance.current) {
        modalMapInstance.current.remove();
        modalMapInstance.current = null;
      }
      const center = requestCenter(selectedRequest);
      const map = L.map(modalMapRef.current).setView(center, 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:oklch(0.55 0.15 230);border:3px solid white;box-shadow:0 0 0 8px color-mix(in oklab, oklch(0.55 0.15 230) 28%, transparent),0 10px 25px rgba(0,0,0,.22);"></div>`,
      });
      const marker = L.marker(center, { icon }).addTo(map);
      marker.bindPopup(`<strong>${selectedRequest.userName}</strong><br/>Current request location<br/>${selectedRequest.location.area}<br/>${selectedRequest.amount} ML`).openPopup();
      modalMapInstance.current = map;
      modalMarkerRef.current = marker;
      setTimeout(() => map.invalidateSize(), 80);
    })();
    return () => {
      cancelled = true;
      if (modalMapInstance.current) {
        modalMapInstance.current.remove();
        modalMapInstance.current = null;
      }
    };
  }, [mapOpen, selectedRequest]);

  const update = (id: string, status: RequestStatus, label: string) => {
    const r = requests.find((x) => x.id === id);
    setState((s) => ({ ...s, requests: s.requests.map((x) => (x.id === id ? { ...x, status } : x)) }));
    if (r) {
      addLog("Admin", `${label} request from ${r.userName} (${r.amount} ML, ${r.location.area})`);
      notify(`Request ${status.toLowerCase()}`, `Your ${r.amount} ML request for ${r.location.area} was ${status.toLowerCase()}.`, r.userEmail);
    }
    toast.success(`Request ${label.toLowerCase()}`);
  };

  const viewOnMap = (request: DemandRequest) => {
    setSelectedRequest(request);
    setMapOpen(true);
    addLog("Admin", `Viewed request on map for ${request.userName} (${request.amount} ML)`);
  };

  const combine = (area: string, list: DemandRequest[]) => {
    createCombinedSupplyPlan(area, list.map((r) => r.id), list.reduce((sum, r) => sum + r.amount, 0), list[0]?.location.city, list[0]?.location.pincode);
    toast.success(`Combined supply plan created for ${area}`);
  };

  return (
    <div className="page-enter space-y-6">
      {groups.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.area} className="interactive-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{group.requests.length} requests from</p>
                  <h3 className="text-xl font-semibold">{group.area}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Total demand {group.totalAmount} ML</p>
                </div>
                <Button variant="secondary" onClick={() => combine(group.area, group.requests)}>Create Combined Supply Plan</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {combinedPlans.length > 0 && (
        <Card className="interactive-card p-5">
          <h3 className="mb-3 text-lg font-semibold">Combined supply plans</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {combinedPlans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-border p-4">
                <div className="text-sm text-muted-foreground">{plan.city ? `${plan.city}, ${plan.pincode}` : "Combined area"}</div>
                <div className="mt-2 text-lg font-semibold">{plan.area}</div>
                <p className="text-sm text-muted-foreground">{plan.requestIds.length} requests • {plan.totalAmount} ML</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin review</div>
            <h3 className="text-xl font-semibold">User requests</h3>
          </div>
          <Badge variant="secondary">{requests.length} requests</Badge>
        </div>
        {requests.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No requests yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const remaining = r.createdAt + r.ttlMs - now;
                const live = r.status === "Pending" || r.status === "Active";
                return (
                  <TableRow key={r.id} className="soft-table-row">
                    <TableCell className="font-medium">{r.userName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.userPhone}<br />{r.userEmail}</TableCell>
                    <TableCell>{r.location.area}
                      <div className="text-xs text-muted-foreground">{r.location.city} • {r.location.pincode}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{requestCoordinateLabel(r)}</TableCell>
                    <TableCell>{r.amount} ML</TableCell>
                    <TableCell className="max-w-xs truncate">{r.purpose}</TableCell>
                    <TableCell className="capitalize">{r.priority}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.submittedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-y-2">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => viewOnMap(r)}><MapPin className="mr-1 h-3.5 w-3.5" />View on Map</Button>
                        <Button size="sm" variant="outline" disabled={!live} onClick={() => update(r.id, "Approved", "Approved")}>Approve</Button>
                        <Button size="sm" variant="outline" disabled={!live} onClick={() => update(r.id, "Rejected", "Rejected")}>Reject</Button>
                        <Button size="sm" variant="outline" disabled={r.status === "Completed" || r.status === "Expired"} onClick={() => update(r.id, "Completed", "Completed")}>Completed</Button>
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground">{live ? fmt(remaining) : "—"}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={mapOpen} onOpenChange={(open) => { if (!open) setSelectedRequest(null); setMapOpen(open); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Request location</DialogTitle>
            <DialogDescription>View this requester’s location and request details on a map.</DialogDescription>
          </DialogHeader>
          {selectedRequest ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Requester</p>
                  <p className="font-semibold">{selectedRequest.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request</p>
                  <p className="font-semibold">{selectedRequest.amount} ML • {selectedRequest.purpose}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-background p-4">
                <div ref={modalMapRef} className="h-[360px] w-full rounded-3xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border p-4">
                  <div className="text-xs text-muted-foreground">Area</div>
                  <div className="font-semibold">{selectedRequest.location.area}</div>
                </div>
                <div className="rounded-3xl border border-border p-4">
                  <div className="text-xs text-muted-foreground">Coordinates</div>
                  <div className="font-semibold">{selectedRequest.coordinates ? `${selectedRequest.coordinates.lat.toFixed(4)}, ${selectedRequest.coordinates.lng.toFixed(4)}` : "Fallback"}</div>
                </div>
                <div className="rounded-3xl border border-border p-4">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-semibold">{selectedRequest.status}</div>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setMapOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

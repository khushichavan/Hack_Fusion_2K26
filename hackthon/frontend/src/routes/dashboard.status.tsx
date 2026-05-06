import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession, sweepExpired, useStore, type RequestStatus } from "@/lib/store";

export const Route = createFileRoute("/dashboard/status")({
  component: StatusPage,
});

function statusBadge(status: RequestStatus | undefined) {
  const map: Record<RequestStatus, string> = {
    Pending: "bg-warning text-warning-foreground hover:bg-warning",
    Active: "bg-primary text-primary-foreground hover:bg-primary",
    Approved: "bg-success text-success-foreground hover:bg-success",
    Rejected: "bg-destructive text-destructive-foreground hover:bg-destructive",
    Completed: "bg-success text-success-foreground hover:bg-success",
    Expired: "bg-muted text-muted-foreground hover:bg-muted",
  };
  if (!status || !map[status]) return <Badge variant="secondary">Unknown</Badge>;
  return <Badge className={map[status]}>{status}</Badge>;
}

function fmt(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "-";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function locationTitle(request: {
  location?: { area?: string };
  coordinates?: { lat: number; lng: number };
}) {
  if (request.location?.area?.trim()) return request.location.area;
  if (request.coordinates) return "GPS location";
  return "Location unavailable";
}

function locationSubtitle(request: {
  location?: { city?: string; pincode?: string };
  coordinates?: { lat: number; lng: number };
}) {
  const parts = [request.location?.city, request.location?.pincode].filter(Boolean);
  if (parts.length) return parts.join(" | ");
  if (request.coordinates)
    return `${request.coordinates.lat.toFixed(4)}, ${request.coordinates.lng.toFixed(4)}`;
  return "No saved coordinates";
}

function submittedAt(value: number | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function StatusPage() {
  const session = getSession();
  const normalizedEmail = session?.email?.trim().toLowerCase();
  const allRequests = useStore((s) => s.requests);
  const requests = useMemo(
    () => allRequests.filter((r) => r.userEmail?.trim().toLowerCase() === normalizedEmail),
    [allRequests, normalizedEmail],
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      sweepExpired();
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="page-enter p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Request status
          </div>
          <h3 className="text-xl font-semibold">Your water requests</h3>
        </div>
        <Badge variant="secondary">{requests.length} total</Badge>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No requests yet. Create one from the Demand Request page.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time remaining</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const remaining = (request.createdAt ?? 0) + (request.ttlMs ?? 0) - now;
              const isLive = request.status === "Pending" || request.status === "Active";
              return (
                <TableRow key={request.id} className="soft-table-row">
                  <TableCell className="font-medium">{request.id ?? "N/A"}</TableCell>
                  <TableCell>
                    <div>{locationTitle(request)}</div>
                    <div className="text-xs text-muted-foreground">{locationSubtitle(request)}</div>
                  </TableCell>
                  <TableCell>{request.amount ?? 0} ML</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.purpose ?? "Not specified"}
                  </TableCell>
                  <TableCell className="capitalize">{request.priority ?? "medium"}</TableCell>
                  <TableCell>{statusBadge(request.status)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {isLive ? fmt(remaining) : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {submittedAt(request.submittedAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

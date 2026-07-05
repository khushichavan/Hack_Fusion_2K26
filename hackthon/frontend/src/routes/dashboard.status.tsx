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
import { getSession, sweepExpired, useStore } from "@/lib/store";
import { RequestStatusBadge } from "@/components/status-badges";
import { formatDateTime, formatRemaining } from "@/lib/format";

export const Route = createFileRoute("/dashboard/status")({
  component: StatusPage,
});

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
                  <TableCell>
                    <RequestStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {isLive ? formatRemaining(remaining, "-") : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(request.submittedAt)}
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

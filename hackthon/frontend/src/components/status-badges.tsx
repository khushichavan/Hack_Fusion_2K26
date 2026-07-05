import { Badge } from "@/components/ui/badge";
import type { Area, RequestStatus } from "@/lib/store";

// Reusable badge color classes shared across status displays.
export const BADGE_SUCCESS = "bg-success text-success-foreground hover:bg-success";
export const BADGE_WARNING = "bg-warning text-warning-foreground hover:bg-warning";
export const BADGE_DESTRUCTIVE = "bg-destructive text-destructive-foreground hover:bg-destructive";
export const BADGE_MUTED = "bg-muted text-muted-foreground hover:bg-muted";
export const BADGE_PRIMARY = "bg-primary text-primary-foreground hover:bg-primary";

const REQUEST_STATUS_BADGE: Record<RequestStatus, string> = {
  Pending: BADGE_WARNING,
  Active: BADGE_PRIMARY,
  Approved: BADGE_SUCCESS,
  Rejected: BADGE_DESTRUCTIVE,
  Completed: BADGE_SUCCESS,
  Expired: BADGE_MUTED,
};

export function RequestStatusBadge({ status }: { status?: RequestStatus }) {
  if (!status || !REQUEST_STATUS_BADGE[status]) return <Badge variant="secondary">Unknown</Badge>;
  return <Badge className={REQUEST_STATUS_BADGE[status]}>{status}</Badge>;
}

export function AreaStatusBadge({ status }: { status: Area["status"] }) {
  if (status === "Full") return <Badge className={BADGE_SUCCESS}>Full</Badge>;
  if (status === "Partial") return <Badge className={BADGE_WARNING}>Partial</Badge>;
  return <Badge variant="destructive">No Supply</Badge>;
}

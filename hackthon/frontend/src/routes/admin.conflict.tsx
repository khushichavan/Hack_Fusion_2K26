import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useStore, recalcAllocation, addLog } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/conflict")({
  component: ConflictPage,
});

function ConflictPage() {
  const supply = useStore((s) => s.totalSupply);
  const areas = useStore((s) => s.areas);
  const demand = areas.reduce((a, b) => a + b.demand, 0);
  const conflict = demand > supply;
  const affected = areas.filter((a) => a.status !== "Full");

  const resolve = () => {
    recalcAllocation("Admin");
    addLog("Admin", "Resolved allocation conflict by priority");
    toast.success("Conflict resolved using priority order");
  };

  return (
    <div className="space-y-6">
      <Card
        className={`p-6 ${conflict ? "border-destructive/40 bg-destructive/5" : "border-success/40 bg-success/5"}`}
      >
        <div className="flex items-start gap-3">
          {conflict ? (
            <AlertTriangle className="h-6 w-6 text-destructive" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-success" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {conflict ? "Conflict detected" : "No active conflict"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {conflict
                ? `Total demand (${demand} ML) exceeds available supply (${supply} ML) by ${demand - supply} ML.`
                : `Supply (${supply} ML) covers full demand (${demand} ML).`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resolve}>Resolve conflict</Button>
            <Button
              variant="outline"
              onClick={() => {
                recalcAllocation("Admin");
                toast.success("Allocation recalculated");
              }}
            >
              Recalculate
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-2 font-semibold">Resolution priority</h3>
        <p className="text-sm text-muted-foreground">
          High → Medium → Low. Each area receives its full demand if possible, then the remainder
          cascades down.
        </p>
        <div className="mt-4 flex gap-2">
          <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
            1. High
          </Badge>
          <Badge className="bg-warning text-warning-foreground hover:bg-warning">2. Medium</Badge>
          <Badge className="bg-muted text-muted-foreground hover:bg-muted">3. Low</Badge>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Affected areas & justification</h3>
        {affected.length === 0 ? (
          <p className="text-sm text-muted-foreground">All areas fully allocated.</p>
        ) : (
          <ul className="space-y-3">
            {affected.map((a) => (
              <li key={a.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {a.name} <span className="text-sm text-muted-foreground">· {a.category}</span>
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      Priority: {a.priority} · {a.allocated}/{a.demand} ML
                    </div>
                  </div>
                  {a.status === "Partial" && (
                    <Badge className="bg-warning text-warning-foreground hover:bg-warning">
                      Partial
                    </Badge>
                  )}
                  {a.status === "No Supply" && <Badge variant="destructive">No supply</Badge>}
                </div>
                <p className="mt-2 text-sm">{a.justification}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

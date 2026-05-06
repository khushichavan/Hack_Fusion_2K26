import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setState, useStore, recalcAllocation, addLog } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/supply")({
  component: SupplyMgmt,
});

function SupplyMgmt() {
  const supply = useStore((s) => s.totalSupply);
  const ttl = useStore((s) => s.defaultTtlMin);
  const [val, setVal] = useState(supply);
  const [limit, setLimit] = useState(ttl);

  const save = () => {
    setState((s) => ({ ...s, totalSupply: Number(val) }));
    addLog("Admin", `Set supply to ${val} ML`);
    recalcAllocation("Admin");
    toast.success("Supply updated & allocations recalculated");
  };
  const reduce = () => {
    const next = Math.max(0, supply - 200);
    setState((s) => ({ ...s, totalSupply: next }));
    setVal(next);
    addLog("Admin", `Reduced supply by 200 ML (now ${next})`);
    recalcAllocation("Admin");
    toast.success("Supply reduced by 200 ML");
  };
  const recalc = () => {
    recalcAllocation("Admin");
    toast.success("Allocation recalculated");
  };
  const saveTtl = () => {
    setState((s) => ({ ...s, defaultTtlMin: Number(limit) }));
    addLog("Admin", `Set request time limit to ${limit} min`);
    toast.success(`Time limit set to ${limit} minutes`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Total water supply</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Daily supply target (ML)</Label>
            <Input type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>Save / Update</Button>
            <Button variant="outline" onClick={reduce}>
              Reduce supply (-200)
            </Button>
            <Button variant="secondary" onClick={recalc}>
              Recalculate allocation
            </Button>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Allocation time limit</h3>
        <p className="text-sm text-muted-foreground">
          All new allocations expire after this many minutes.
        </p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Minutes</Label>
            <Input
              type="number"
              min={5}
              max={240}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
          <Button onClick={saveTtl}>Update time limit</Button>
        </div>
      </Card>
    </div>
  );
}

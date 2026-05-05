import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { applyTheme, clearAll, useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Appearance</h3>
        <div className="mt-6 flex items-center justify-between">
          <Label>Dark theme</Label>
          <Switch checked={theme === "dark"} onCheckedChange={(v) => { applyTheme(v ? "dark" : "light"); toast.success(`${v ? "Dark" : "Light"} mode enabled`); }} />
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Account</h3>
        <p className="mt-1 text-sm text-muted-foreground">Manage your local data.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="destructive" onClick={() => { clearAll(); toast.success("Local data cleared"); navigate({ to: "/" }); }}>Clear local data</Button>
        </div>
      </Card>
    </div>
  );
}

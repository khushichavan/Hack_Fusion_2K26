import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing, Database, Gauge, Moon, ShieldCheck, UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyTheme, clearAll, getSession, resetDemoData, setState, useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const theme = useStore((s) => s.theme);
  const totalSupply = useStore((s) => s.totalSupply);
  const defaultTtlMin = useStore((s) => s.defaultTtlMin);
  const session = getSession();
  const admin = useStore((s) => s.users.find((u) => u.email === session?.email));
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: admin?.name ?? "",
    phone: admin?.phone ?? "",
    department: admin?.department ?? "Water Operations",
    emergencyContact: admin?.emergencyContact ?? "",
  });
  const [ops, setOps] = useState({
    supply: String(totalSupply),
    ttl: String(defaultTtlMin),
    highPriorityAlerts: true,
    conflictWarnings: true,
    auditExports: false,
  });

  const saveAdminProfile = () => {
    if (!admin) return toast.error("No active admin session");
    setState((s) => ({
      ...s,
      users: s.users.map((item) => (item.email === admin.email ? { ...item, ...profile } : item)),
    }));
    toast.success("Admin profile saved");
  };

  const saveOperations = () => {
    const supply = Number(ops.supply);
    const ttl = Number(ops.ttl);
    if (!Number.isFinite(supply) || supply <= 0) return toast.error("Enter a valid supply total");
    if (!Number.isFinite(ttl) || ttl <= 0) return toast.error("Enter a valid request timer");
    setState((s) => ({ ...s, totalSupply: supply, defaultTtlMin: ttl }));
    toast.success("Operational defaults saved");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <UserCog className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Admin Profile</h3>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SettingInput
            label="Admin name"
            value={profile.name}
            onChange={(name) => setProfile({ ...profile, name })}
          />
          <SettingInput
            label="Phone number"
            value={profile.phone}
            onChange={(phone) => setProfile({ ...profile, phone })}
          />
          <SettingInput
            label="Department"
            value={profile.department}
            onChange={(department) => setProfile({ ...profile, department })}
          />
          <SettingInput
            label="Emergency escalation"
            value={profile.emergencyContact}
            onChange={(emergencyContact) => setProfile({ ...profile, emergencyContact })}
          />
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={admin?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={admin?.role ?? "admin"} disabled />
          </div>
        </div>
        <Button className="mt-6" onClick={saveAdminProfile}>
          Save admin profile
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Operational Defaults</h3>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SettingInput
            label="Total city supply (ML)"
            value={ops.supply}
            onChange={(supply) => setOps({ ...ops, supply })}
          />
          <SettingInput
            label="Default request timer (minutes)"
            value={ops.ttl}
            onChange={(ttl) => setOps({ ...ops, ttl })}
          />
        </div>
        <Button className="mt-6" onClick={saveOperations}>
          Save defaults
        </Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Admin Alerts</h3>
          </div>
          <div className="mt-6 space-y-5">
            <ToggleRow
              label="High-priority demand alerts"
              description="Highlight hospital and emergency requests immediately."
              checked={ops.highPriorityAlerts}
              onCheckedChange={(highPriorityAlerts) => setOps({ ...ops, highPriorityAlerts })}
            />
            <ToggleRow
              label="Conflict warnings"
              description="Warn when demand is greater than available supply."
              checked={ops.conflictWarnings}
              onCheckedChange={(conflictWarnings) => setOps({ ...ops, conflictWarnings })}
            />
            <ToggleRow
              label="Scheduled audit exports"
              description="Prepare logs for review at the end of every shift."
              checked={ops.auditExports}
              onCheckedChange={(auditExports) => setOps({ ...ops, auditExports })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Appearance</h3>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <Label>Dark theme</Label>
              <p className="text-sm text-muted-foreground">Use a darker admin console.</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => {
                applyTheme(v ? "dark" : "light");
                toast.success(`${v ? "Dark" : "Light"} mode enabled`);
              }}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Data Management</h3>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Manage local demo state, allocation data, users, notifications, and activity logs.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetDemoData();
              toast.success("Demo data reset");
            }}
          >
            Reset demo data
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: "/admin/logs" })}>
            View audit logs
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearAll();
              toast.success("Local data cleared");
              navigate({ to: "/" });
            }}
          >
            Clear all data
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Governance</h3>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border p-3">Allocation rule: priority first</div>
          <div className="rounded-lg border p-3">Log retention: latest 200 events</div>
          <div className="rounded-lg border p-3">State sync: backend API when available</div>
        </div>
      </Card>
    </div>
  );
}

function SettingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, MapPin, Moon, Shield, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyTheme, clearAll, getSession, setState, useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const session = getSession();
  const user = useStore((s) => s.users.find((u) => u.email === session?.email));
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState({
    expiry: true,
    approvals: true,
    broadcasts: true,
  });
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    emergencyContact: user?.emergencyContact ?? "",
    preferredLanguage: user?.preferredLanguage ?? "English",
  });

  const saveProfile = () => {
    if (!user) return toast.error("No active user session");
    setState((s) => ({
      ...s,
      users: s.users.map((item) => (item.email === user.email ? { ...item, ...profile } : item)),
    }));
    toast.success("Profile settings saved");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <UserRound className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Citizen Profile</h3>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SettingInput
            label="Full name"
            value={profile.name}
            onChange={(name) => setProfile({ ...profile, name })}
          />
          <SettingInput
            label="Phone number"
            value={profile.phone}
            onChange={(phone) => setProfile({ ...profile, phone })}
          />
          <SettingInput
            label="Primary area"
            value={profile.location}
            onChange={(location) => setProfile({ ...profile, location })}
          />
          <SettingInput
            label="Emergency contact"
            value={profile.emergencyContact}
            onChange={(emergencyContact) => setProfile({ ...profile, emergencyContact })}
          />
          <SettingInput
            label="Preferred language"
            value={profile.preferredLanguage}
            onChange={(preferredLanguage) => setProfile({ ...profile, preferredLanguage })}
          />
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
        </div>
        <Button className="mt-6" onClick={saveProfile}>
          Save profile
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Notification Options</h3>
        </div>
        <div className="mt-6 space-y-5">
          <ToggleRow
            label="Request expiry reminders"
            description="Show alerts before active water requests expire."
            checked={alerts.expiry}
            onCheckedChange={(expiry) => setAlerts({ ...alerts, expiry })}
          />
          <ToggleRow
            label="Approval and rejection updates"
            description="Notify when an admin changes your request status."
            checked={alerts.approvals}
            onCheckedChange={(approvals) => setAlerts({ ...alerts, approvals })}
          />
          <ToggleRow
            label="City broadcast notices"
            description="Receive area-wide supply and maintenance announcements."
            checked={alerts.broadcasts}
            onCheckedChange={(broadcasts) => setAlerts({ ...alerts, broadcasts })}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Appearance</h3>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <Label>Dark theme</Label>
              <p className="text-sm text-muted-foreground">Use a darker dashboard surface.</p>
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

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Location & Data</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Saved request location and local demo data are stored on this device.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard/location" })}>
              Update location
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAll();
                toast.success("Local data cleared");
                navigate({ to: "/" });
              }}
            >
              Clear local data
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border p-3">Role: {user?.role ?? "user"}</div>
          <div className="rounded-lg border p-3">Session: local browser session</div>
          <div className="rounded-lg border p-3">Backend sync: enabled when API is running</div>
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

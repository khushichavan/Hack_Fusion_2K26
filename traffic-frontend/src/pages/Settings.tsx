import { useState } from "react";
import {
  Bell,
  Globe,
  KeyRound,
  Map as MapIcon,
  Palette,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [language, setLanguage] = useState("en");
  const [notif, setNotif] = useState({
    alerts: true,
    predictions: true,
    weekly: false,
    marketing: false,
  });
  const [mapStyle, setMapStyle] = useState("dark");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your preferences and configuration." />

      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            { v: "profile", label: "Profile", icon: UserIcon },
            { v: "theme", label: "Theme", icon: Palette },
            { v: "language", label: "Language", icon: Globe },
            { v: "notifications", label: "Notifications", icon: Bell },
            { v: "api", label: "API", icon: KeyRound },
            { v: "map", label: "Map", icon: MapIcon },
            { v: "security", label: "Security", icon: ShieldCheck },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="gap-1.5 border border-white/5 data-[state=active]:border-primary/30"
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <SettingCard title="Profile Information" description="Update your account details.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="s-name">Full name</Label>
                <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button
              variant="gradient"
              onClick={() => {
                updateUser({ name, email });
                toast.success("Profile updated");
              }}
            >
              Save changes
            </Button>
          </SettingCard>
        </TabsContent>

        <TabsContent value="theme">
          <SettingCard title="Appearance" description="Customise how TrafficAI looks.">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    toast.success(`${t === "dark" ? "Dark" : "Light"} theme applied`);
                  }}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    theme === t ? "border-primary" : "border-white/10"
                  }`}
                >
                  <div
                    className={`mb-3 h-20 rounded-lg ${
                      t === "dark"
                        ? "bg-gradient-to-br from-slate-900 to-slate-800"
                        : "bg-gradient-to-br from-slate-100 to-white"
                    }`}
                  />
                  <p className="font-medium capitalize">{t} mode</p>
                </button>
              ))}
            </div>
          </SettingCard>
        </TabsContent>

        <TabsContent value="language">
          <SettingCard title="Language & Region" description="Set your preferred language.">
            <div className="space-y-2 sm:max-w-xs">
              <Label>Language</Label>
              <Select value={language} onValueChange={(v) => { setLanguage(v); toast.success("Language updated"); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingCard>
        </TabsContent>

        <TabsContent value="notifications">
          <SettingCard title="Notifications" description="Choose what you want to hear about.">
            {[
              { key: "alerts", label: "Incident alerts", desc: "Critical accidents and emergencies" },
              { key: "predictions", label: "Prediction updates", desc: "When new predictions are ready" },
              { key: "weekly", label: "Weekly summary", desc: "Digest of traffic analytics" },
              { key: "marketing", label: "Product updates", desc: "News and feature announcements" },
            ].map((n, i, arr) => (
              <div key={n.key}>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium">{n.label}</p>
                    <p className="text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch
                    checked={notif[n.key as keyof typeof notif]}
                    onCheckedChange={(v) =>
                      setNotif((prev) => ({ ...prev, [n.key]: v }))
                    }
                  />
                </div>
                {i < arr.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </SettingCard>
        </TabsContent>

        <TabsContent value="api">
          <SettingCard title="API Configuration" description="Connect to your traffic data backend.">
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input defaultValue="https://api.trafficai.mock/v1" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" defaultValue="sk_live_trafficai_demo_key_9f3a" />
            </div>
            <div className="space-y-2">
              <Label>Refresh interval</Label>
              <Select defaultValue="30">
                <SelectTrigger className="sm:max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="gradient" onClick={() => toast.success("API settings saved")}>
              Save configuration
            </Button>
          </SettingCard>
        </TabsContent>

        <TabsContent value="map">
          <SettingCard title="Map Settings" description="Customise the interactive map.">
            <div className="space-y-2 sm:max-w-xs">
              <Label>Map style</Label>
              <Select value={mapStyle} onValueChange={setMapStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {[
              "Show traffic markers",
              "Show camera markers",
              "Show congestion routes",
              "Auto-center on my location",
            ].map((label, i) => (
              <div key={label} className="flex items-center justify-between py-1">
                <p className="font-medium">{label}</p>
                <Switch defaultChecked={i < 3} />
              </div>
            ))}
          </SettingCard>
        </TabsContent>

        <TabsContent value="security">
          <SettingCard title="Security" description="Keep your account safe.">
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>New password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Confirm password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
              <div>
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch />
            </div>
            <Button variant="gradient" onClick={() => toast.success("Security settings updated")}>
              Update password
            </Button>
          </SettingCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

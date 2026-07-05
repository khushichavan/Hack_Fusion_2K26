import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/components/common/Icon";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { activityApi } from "@/services/mockApi";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { data: activities } = useAsync(() => activityApi.list(), []);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
  });

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const stats = [
    { label: "Predictions", value: "1,284" },
    { label: "Alerts handled", value: "342" },
    { label: "Reports", value: "56" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account overview and activity." />

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-sky-500/40 via-violet-500/40 to-fuchsia-500/40" />
            <CardContent className="-mt-12 space-y-4 text-center">
              <Avatar className="mx-auto h-24 w-24 border-4 border-card">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="default" className="mt-2 capitalize">
                  <Shield className="h-3 w-3" /> {user.role}
                </Badge>
              </div>

              <EditProfileDialog form={form} setForm={setForm} onSave={() => { updateUser(form); toast.success("Profile updated"); }} />

              <Separator />
              <div className="grid grid-cols-3 gap-2">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-left text-sm">
                <InfoRow icon={<Mail className="h-4 w-4" />} value={user.email} />
                {user.phone && <InfoRow icon={<Phone className="h-4 w-4" />} value={user.phone} />}
                {user.location && <InfoRow icon={<MapPin className="h-4 w-4" />} value={user.location} />}
                <InfoRow icon={<Calendar className="h-4 w-4" />} value={`Joined ${formatDate(user.createdAt)}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {form.bio || user.bio || "No bio provided yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(activities ?? []).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <DynamicIcon name={a.icon} className="h-4 w-4" />
                  </span>
                  <div className="flex-1 border-b border-white/5 pb-4">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.detail}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {formatDateTime(a.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function EditProfileDialog({
  form,
  setForm,
  onSave,
}: {
  form: { name: string; phone: string; location: string; bio: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ name: string; phone: string; location: string; bio: string }>
  >;
  onSave: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Pencil className="h-4 w-4" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="gradient" onClick={onSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

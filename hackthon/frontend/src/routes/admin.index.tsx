import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setState, useStore, getSession, addLog } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminProfile,
});

function AdminProfile() {
  const session = getSession();
  const u = useStore((s) => s.users.find((x) => x.email === session?.email));
  const areas = useStore((s) => s.areas);
  const requests = useStore((s) => s.requests);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(u);

  if (!u || !form) return null;

  const save = () => {
    setState((s) => ({ ...s, users: s.users.map((x) => (x.email === u.email ? { ...x, ...form } : x)) }));
    addLog(form.name, "Updated profile");
    setEdit(false);
    toast.success("Profile updated");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">{form.name.charAt(0).toUpperCase()}</div>
          <div className="flex-1">
            <div className="text-lg font-semibold">{form.name}</div>
            <div className="text-sm text-muted-foreground">{form.email}</div>
          </div>
          <Badge>Admin</Badge>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          {(["name", "email", "phone", "location"] as const).map((f) => (
            <div key={f} className="space-y-1">
              <Label className="capitalize text-xs text-muted-foreground">{f}</Label>
              <Input value={form[f]} disabled={!edit} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {edit ? (
            <>
              <Button variant="outline" onClick={() => { setForm(u); setEdit(false); }}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          ) : (
            <Button onClick={() => setEdit(true)}>Edit</Button>
          )}
        </div>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-3 font-semibold">City overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <Mini label="Areas" value={areas.length} />
          <Mini label="Active requests" value={requests.filter((r) => r.status === "Pending" || r.status === "Active").length} />
          <Mini label="Critical zones" value={areas.filter((a) => a.status === "No Supply").length} />
        </div>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-lg bg-muted p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>;
}

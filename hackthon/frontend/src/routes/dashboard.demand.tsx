import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  setState,
  uid,
  useStore,
  getSession,
  addLog,
  notify,
  computeRequestScore,
  type DemandRequest,
  type Priority,
} from "@/lib/store";
import { toast } from "sonner";
import { apiCreateComplaint } from "@/lib/api";

export const Route = createFileRoute("/dashboard/demand")({
  component: DemandPage,
});

const blank = {
  amount: 30,
  purpose: "",
  priority: "medium" as Priority,
  minutes: 30,
  description: "",
};

function formatLocation(location: { area: string; city?: string; pincode?: string } | undefined) {
  if (!location) return "Location not saved";
  return [location.area, location.city, location.pincode].filter(Boolean).join(", ");
}

function DemandPage() {
  const session = getSession();
  const normalizedEmail = session?.email?.trim().toLowerCase();
  const user = useStore((s) =>
    s.users.find((u) => u.email.trim().toLowerCase() === normalizedEmail),
  );
  const defaultTtl = useStore((s) => s.defaultTtlMin);
  const [form, setForm] = useState({ ...blank, minutes: defaultTtl });
  const savedLocation = user?.savedLocation;
  const canSubmit = Boolean(user && savedLocation);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    if (!savedLocation) return toast.error("Please save your location first in Location View");
    if (!form.purpose || form.amount <= 0 || form.minutes <= 0)
      return toast.error("Please fill all request details");

    const { score, scoreLabel } = computeRequestScore(
      form.purpose as DemandRequest["purpose"],
      form.priority,
      form.minutes * 60_000,
      form.amount,
    );
    const req: DemandRequest = {
      id: uid(),
      userEmail: user.email,
      userName: user.name,
      userPhone: user.phone,
      location: savedLocation,
      coordinates:
        savedLocation.lat !== undefined && savedLocation.lng !== undefined
          ? { lat: savedLocation.lat, lng: savedLocation.lng }
          : undefined,
      amount: Number(form.amount),
      purpose: form.purpose as DemandRequest["purpose"],
      priority: form.priority,
      description: form.description,
      createdAt: Date.now(),
      submittedAt: Date.now(),
      ttlMs: form.minutes * 60_000,
      status: "Pending",
      score,
      scoreLabel,
    };

    setState((s) => ({ ...s, requests: [req, ...s.requests] }));
    addLog(user.name, `Submitted water request for ${req.amount} ML at ${savedLocation.area}`);
    notify(
      "Water request submitted",
      `Your ${req.amount} ML request for ${savedLocation.area} is pending with location.`,
      user.email,
    );
    toast.success("Water request submitted successfully with location");
    apiCreateComplaint({
      user_email: user.email,
      zone_id: "zone-c",
      category: form.purpose,
      description: form.description || `${form.purpose} request for ${form.amount} ML`,
      lat: savedLocation.lat,
      lng: savedLocation.lng,
    }).catch(() => undefined);
    setForm({ ...blank, minutes: defaultTtl });
  };

  return (
    <Card className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold text-foreground">Location required</div>
          <p>
            {canSubmit
              ? "Your saved location is attached to every water request."
              : "Save a location first in Location View before submitting any request."}
          </p>
        </div>
        <div className="rounded-2xl bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm">
          {formatLocation(savedLocation)}
        </div>
      </div>

      <h3 className="mb-4 text-lg font-semibold">Submit complaint or water request</h3>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Saved location</Label>
            <Input value={savedLocation?.area ?? ""} disabled placeholder="Save location first" />
          </div>
          <div className="space-y-2">
            <Label>Quantity (ML)</Label>
            <Input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select
              value={form.purpose}
              onValueChange={(value) => setForm({ ...form, purpose: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Drinking Water">Drinking Water</SelectItem>
                <SelectItem value="Household Use">Household Use</SelectItem>
                <SelectItem value="Hospital/Emergency">Hospital/Emergency</SelectItem>
                <SelectItem value="Community Tank">Community Tank</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(value) => setForm({ ...form, priority: value as Priority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Time limit / urgency (minutes)</Label>
            <Input
              type="number"
              min={5}
              max={240}
              value={form.minutes}
              onChange={(e) => setForm({ ...form, minutes: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe why water is needed…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmit}>
            Submit Water Request
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setForm({ ...blank, minutes: defaultTtl })}
          >
            Clear form
          </Button>
        </div>
      </form>
    </Card>
  );
}

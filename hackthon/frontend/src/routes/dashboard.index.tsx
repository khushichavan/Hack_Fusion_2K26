import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { setState, useStore, getSession, addLog } from "@/lib/store";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: ProfilePage,
});

function ProfilePage() {
  const session = getSession();
  const u = useStore((s) => s.users.find((x) => x.email === session?.email));
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(u);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!u || !form) return null;

  const save = () => {
    setState((s) => ({
      ...s,
      users: s.users.map((x) => (x.email === u.email ? { ...x, ...form } : x)),
    }));
    addLog(form.name, "Updated profile");
    setEdit(false);
    toast.success("Profile updated");
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setForm({ ...form, avatar: dataUrl });
      setState((s) => ({
        ...s,
        users: s.users.map((x) => (x.email === u.email ? { ...x, avatar: dataUrl } : x)),
      }));
      toast.success("Profile picture updated");
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary">
                {form.name.charAt(0).toUpperCase()}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{form.name}</h2>
            <p className="text-muted-foreground capitalize">{form.role} account</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Upload picture
            </Button>
            {edit ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(u);
                    setEdit(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={save}>Save</Button>
              </>
            ) : (
              <Button onClick={() => setEdit(true)}>Edit</Button>
            )}
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(["name", "email", "phone", "location"] as const).map((f) => (
            <div key={f} className="space-y-2">
              <Label className="capitalize">{f}</Label>
              <Input
                value={form[f]}
                disabled={!edit}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

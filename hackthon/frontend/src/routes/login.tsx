import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, MapPinned, ShieldCheck, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSession, setState, useStore, type Role } from "@/lib/store";
import { addLog, notify } from "@/lib/store";
import { apiLogin, setAuthToken } from "@/lib/api";
import { toast } from "sonner";
import heroImg from "@/assets/hero-water.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - AquaResolve AI" },
      { name: "description", content: "Sign in to AquaResolve AI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const users = useStore((s) => s.users);
  const [role, setRole] = useState<Role>("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiLogin({ email: email.trim(), password });
      if (result.token) {
        setAuthToken(result.token);
      }
      if (result.user.role !== role) {
        toast.error("Invalid role for this account");
        return;
      }
      const found = users.find(
        (u) => u.email.trim().toLowerCase() === result.user.email.trim().toLowerCase(),
      ) ?? {
        id: result.user.email,
        name: result.user.username,
        email: result.user.email,
        phone: "",
        location: "",
        password: "",
        role: result.user.role,
      };
      setState((s) => {
        const exists = s.users.some(
          (u) => u.email.trim().toLowerCase() === found.email.trim().toLowerCase(),
        );
        return exists
          ? {
              ...s,
              users: s.users.map((u) =>
                u.email.trim().toLowerCase() === found.email.trim().toLowerCase()
                  ? { ...u, role: found.role }
                  : u,
              ),
            }
          : { ...s, users: [...s.users, found] };
      });
      setSession({ email: found.email, role: found.role });
      addLog(found.name, "Logged in");
      notify("Welcome back", `Signed in as ${found.role}.`, found.email);
      toast.success("Welcome back!");
      navigate({ to: role === "citizen" || role === "user" ? "/dashboard" : "/admin" });
    } catch (error) {
      console.error(error);
      toast.error("Invalid email, password, or backend is not running");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage AquaResolve AI allocations.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@city.gov"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </Field>
        <Field label="Role">
          <RoleSelect value={role} onChange={setRole} />
        </Field>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
        {/* Demo credentials removed for security */}
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden p-12 text-white md:flex md:flex-col md:justify-between">
        <img
          src={heroImg}
          alt="Urban river and water infrastructure"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(5,45,58,0.92),rgba(12,91,96,0.78),rgba(55,94,70,0.56))]" />
        <Link to="/" className="relative z-10 flex items-center gap-2 font-semibold">
          <Droplets className="h-5 w-5" /> AquaResolve AI
        </Link>
        <div className="relative z-10 max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Waves className="h-3.5 w-3.5" /> Distribution intelligence
          </div>
          <h2 className="text-3xl font-bold">AquaResolve AI keeps city supply decisions clear.</h2>
          <p className="mt-3 max-w-sm text-white/80">
            Visualize demand, route requests by location, and keep allocation decisions transparent.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              { icon: MapPinned, label: "Location-aware citizen requests" },
              { icon: ShieldCheck, label: "Separate admin and user workflows" },
              { icon: Droplets, label: "Real-time allocation status" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg bg-white/12 p-3 backdrop-blur"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/60">(c) AquaResolve AI 2026</p>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["citizen", "authority", "admin"] as Role[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${value === r ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

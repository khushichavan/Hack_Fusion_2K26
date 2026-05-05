import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSession, setState, useStore, type Role } from "@/lib/store";
import { addLog, notify } from "@/lib/store";
import { apiLogin } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — AquaFlow" }, { name: "description", content: "Sign in to AquaFlow." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const users = useStore((s) => s.users);
  const [role, setRole] = useState<Role>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiLogin({ email: email.trim(), password });
      if (result.user.role !== role) {
        toast.error("Invalid role for this account");
        return;
      }
      const found = users.find((u) => u.email.trim().toLowerCase() === result.user.email.trim().toLowerCase()) ?? {
        id: result.user.email,
        name: result.user.username,
        email: result.user.email,
        phone: "",
        location: "",
        password: "",
        role: result.user.role,
      };
      setState((s) => {
        const exists = s.users.some((u) => u.email.trim().toLowerCase() === found.email.trim().toLowerCase());
        return exists ? s : { ...s, users: [...s.users, found] };
      });
      setSession({ email: found.email, role: found.role });
      addLog(found.name, "Logged in");
      notify("Welcome back", `Signed in as ${found.role}.`, found.email);
      toast.success("Welcome back!");
      navigate({ to: role === "admin" ? "/admin" : "/dashboard" });
    } catch (error) {
      console.error(error);
      toast.error("Invalid email, password, or backend is not running");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your water allocations.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@city.gov" /></Field>
        <Field label="Password"><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Field>
        <Field label="Role"><RoleSelect value={role} onChange={setRole} /></Field>
        <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo: <span className="font-mono">user@city.gov / user123</span> · <span className="font-mono">admin@city.gov / admin123</span>
        </p>
        <p className="text-center text-sm text-muted-foreground">No account? <Link to="/signup" className="font-medium text-primary hover:underline">Create account</Link></p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-[var(--gradient-hero)] p-12 text-white md:flex md:flex-col md:justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold"><Droplets className="h-5 w-5" /> AquaFlow</Link>
        <div>
          <h2 className="text-3xl font-bold">Smart water allocation, made fair.</h2>
          <p className="mt-3 max-w-sm text-white/80">Join cities using AquaFlow to keep every neighborhood flowing.</p>
        </div>
        <p className="text-xs text-white/60">© AquaFlow 2026</p>
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
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

export function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["user", "admin"] as Role[]).map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)}
          className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${value === r ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
          {r}
        </button>
      ))}
    </div>
  );
}

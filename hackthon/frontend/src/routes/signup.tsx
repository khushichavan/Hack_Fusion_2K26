import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setState, uid, useStore, addLog, type Role } from "@/lib/store";
import { apiSignup } from "@/lib/api";
import { toast } from "sonner";
import { AuthShell, Field, RoleSelect } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up - WaterWise" },
      { name: "description", content: "Create your WaterWise account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const users = useStore((s) => s.users);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirm: "",
  });
  const [role, setRole] = useState<Role>("user");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.location || !form.password)
      return toast.error("All fields are required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase()))
      return toast.error("Email already registered");

    setSubmitting(true);
    try {
      await apiSignup({
        username: form.name,
        email: form.email.trim(),
        password: form.password,
        role,
      });
      const newUser = {
        id: uid(),
        name: form.name,
        email: form.email.trim(),
        phone: form.phone,
        location: form.location,
        password: "",
        role,
      };
      setState((s) => ({ ...s, users: [...s.users, newUser] }));
      addLog(newUser.name, "Account created");
      toast.success("Account created - please log in");
      navigate({ to: "/login" });
    } catch (error) {
      console.error(error);
      toast.error("Signup failed. Check that backend is running and email is not already used.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join WaterWise in under a minute.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name">
          <Input required value={form.name} onChange={onChange("name")} placeholder="Jane Doe" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <Input
              type="email"
              required
              value={form.email}
              onChange={onChange("email")}
              placeholder="you@city.gov"
            />
          </Field>
          <Field label="Phone">
            <Input
              required
              value={form.phone}
              onChange={onChange("phone")}
              placeholder="+1 555 0100"
            />
          </Field>
        </div>
        <Field label="Location">
          <Input
            required
            value={form.location}
            onChange={onChange("location")}
            placeholder="Sector 12"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password">
            <Input
              type="password"
              required
              value={form.password}
              onChange={onChange("password")}
              placeholder="Password"
            />
          </Field>
          <Field label="Confirm">
            <Input
              type="password"
              required
              value={form.confirm}
              onChange={onChange("confirm")}
              placeholder="Confirm password"
            />
          </Field>
        </div>
        <Field label="Role">
          <RoleSelect value={role} onChange={setRole} />
        </Field>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

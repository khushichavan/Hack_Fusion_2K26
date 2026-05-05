import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — AquaFlow" },
      { name: "description", content: "Water supply, demand management, allocation dashboards and audit logs for urban utilities." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-[var(--gradient-hero)] pb-24 pt-32 text-white">
        <SiteNav />
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Our Services</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">Everything cities need to manage water fairly.</p>
        </div>
      </div>
      <section className="container mx-auto -mt-16 grid gap-6 px-6 pb-24 md:grid-cols-2">
        {[
          { title: "Supply Management", desc: "Set reservoir totals, schedule releases and monitor capacity." },
          { title: "Demand Requests", desc: "Citizens request additional allocations bound to their location." },
          { title: "Allocation Engine", desc: "Auto-distribute supply, prioritize critical areas, and resolve conflicts." },
          { title: "Time-Limited Tokens", desc: "Each allocation expires after a configurable window." },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl border bg-card p-8 shadow-[var(--shadow-soft)]">
            <Droplets className="mb-4 h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.desc}</p>
          </div>
        ))}
        <div className="md:col-span-2 text-center">
          <Button asChild size="lg"><Link to="/signup">Create an account</Link></Button>
        </div>
      </section>
    </div>
  );
}

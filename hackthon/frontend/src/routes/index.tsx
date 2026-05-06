import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Gauge, Map, ShieldCheck, Timer, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";
import heroImg from "@/assets/hero-water.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaResolve AI - Fair Urban Water Distribution System" },
      {
        name: "description",
        content:
          "Urban water distribution platform for monitoring supply, managing citizen demand, and resolving allocation conflicts in real time.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[100vh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Smart city skyline with rivers and water infrastructure at sunset"
          width={1920}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(6,54,75,0.88),rgba(18,108,116,0.68),rgba(87,123,62,0.42))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/95 to-transparent" />
        <SiteNav />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Waves className="h-3.5 w-3.5" /> Fair Urban Water Distribution System
          </span>
          <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl">
            AquaResolve AI
          </h1>
          <h2 className="mt-4 text-balance text-2xl font-semibold md:text-4xl">
            Fair Urban Water Distribution System
          </h2>
          <p className="mt-6 max-w-2xl text-balance text-lg text-white/85 md:text-xl">
            Resolve urban water supply conflicts in real time. Monitor demand, allocate fairly, and
            keep every neighborhood flowing.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/signup">Get started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/services">Explore services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="services" className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for fair, fast water decisions
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete toolkit for citizens and administrators to balance supply and demand across
            the city.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              title: "Live supply monitoring",
              desc: "Track reservoir levels, allocation rates and shortfalls across districts.",
            },
            {
              icon: Map,
              title: "Geo-aware demand",
              desc: "Citizens raise requests tied to their location with instant routing.",
            },
            {
              icon: Timer,
              title: "Time-bound allocations",
              desc: "Each request runs on a countdown while admins set and adjust limits.",
            },
            {
              icon: ShieldCheck,
              title: "Role-based access",
              desc: "Separate dashboards for users and admins with secure flows.",
            },
            {
              icon: Droplets,
              title: "Conflict resolution",
              desc: "Automatically rebalance when areas exceed available supply.",
            },
            {
              icon: Waves,
              title: "Audit logs",
              desc: "Every action is logged for transparency and accountability.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <span>AquaResolve AI - Fair Urban Water Distribution</span>
          </div>
          <div>(c) 2026 AquaResolve AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AquaFlow" },
      {
        name: "description",
        content:
          "AquaFlow helps cities resolve urban water supply conflicts with fair, time-bound allocations.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-[var(--gradient-hero)] pb-24 pt-32 text-white">
        <SiteNav />
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">About AquaFlow</h1>
        </div>
      </div>
      <section className="container mx-auto max-w-3xl px-6 py-20 text-lg leading-relaxed text-muted-foreground">
        <p>
          AquaFlow is an Urban Water Supply Conflict Resolver that helps cities and citizens work
          together. Our platform balances reservoir supply with neighborhood demand, gives
          administrators visibility into every allocation, and ensures every request is honored —
          fairly and on time.
        </p>
        <p className="mt-6">
          Built with transparency in mind, every allocation has an expiry, every change is logged,
          and every district gets a voice.
        </p>
      </section>
    </div>
  );
}

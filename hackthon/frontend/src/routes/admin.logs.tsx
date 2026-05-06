import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/logs")({
  component: LogsPage,
});

function LogsPage() {
  const logs = useStore((s) => s.logs);
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Audit logs</h3>
      {logs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No activity yet.
        </div>
      ) : (
        <ol className="relative border-l border-border pl-6">
          {logs.map((l) => (
            <li key={l.id} className="mb-6 last:mb-0">
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-sm text-muted-foreground">
                  {new Date(l.ts).toLocaleString()}
                </span>
                <span className="font-medium">{l.actor}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {l.action}
                {l.reason ? ` — ${l.reason}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

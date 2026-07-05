import { Card } from "@/components/ui/card";

type Accent = "primary" | "warning" | "success";

const ACCENT_CLASS: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning-foreground",
  success: "bg-success/15 text-success",
};

/**
 * Summary metric card. When `accent` is provided the title renders as a
 * colored pill; otherwise it renders as a muted label.
 */
export function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: Accent;
}) {
  if (accent) {
    return (
      <Card className="p-6">
        <div
          className={`mb-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${ACCENT_CLASS[accent]}`}
        >
          {title}
        </div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
      </Card>
    );
  }
  return (
    <Card className="p-6">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </Card>
  );
}

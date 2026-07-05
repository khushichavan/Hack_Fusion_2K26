import { Badge } from "@/components/ui/badge";
import { congestionMeta } from "@/lib/traffic";
import type { CongestionLevel } from "@/types";

export function CongestionBadge({ level }: { level: CongestionLevel }) {
  const meta = congestionMeta[level];
  return (
    <Badge variant={meta.badge as "low" | "moderate" | "heavy" | "severe"}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.hex }}
      />
      {meta.label}
    </Badge>
  );
}

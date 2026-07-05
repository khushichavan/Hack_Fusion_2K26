import { Link } from "react-router-dom";
import { Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  to = "/",
  compact = false,
}: {
  className?: string;
  to?: string;
  compact?: boolean;
}) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-lg shadow-primary/30">
        <Waypoints className="h-5 w-5 text-white" />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          Traffic<span className="gradient-text">AI</span>
        </span>
      )}
    </Link>
  );
}

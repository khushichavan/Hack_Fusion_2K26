import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn("inline-block animate-spin text-primary", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
        <LoadingSpinner size={40} />
      </div>
      <p className="text-sm text-muted-foreground">{label}…</p>
    </div>
  );
}

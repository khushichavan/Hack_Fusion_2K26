export function DashboardFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-4 text-xs text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>© {new Date().getFullYear()} TrafficAI — Smart Congestion Prediction.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            All systems operational
          </span>
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

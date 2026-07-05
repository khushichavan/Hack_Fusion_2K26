import { motion } from "framer-motion";
import type { HeatCell } from "@/types";

function colorFor(value: number): string {
  if (value < 35) return "#34d399";
  if (value < 55) return "#fbbf24";
  if (value < 75) return "#fb923c";
  return "#f87171";
}

export function HeatMap({ cells }: { cells: HeatCell[] }) {
  const zones = [...new Set(cells.map((c) => c.zone))];
  const days = [...new Set(cells.map((c) => c.day))];

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
        >
          <div />
          {days.map((d) => (
            <div key={d} className="text-center text-[11px] text-muted-foreground">
              {d}
            </div>
          ))}
          {zones.map((zone) => (
            <div key={zone} className="contents">
              <div className="flex items-center text-xs font-medium text-muted-foreground">
                {zone}
              </div>
              {days.map((day, di) => {
                const cell = cells.find((c) => c.zone === zone && c.day === day);
                const value = cell?.value ?? 0;
                return (
                  <motion.div
                    key={`${zone}-${day}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: di * 0.02 }}
                    title={`${zone} · ${day}: ${value}`}
                    className="group relative flex h-9 items-center justify-center rounded-md text-[10px] font-semibold text-black/70"
                    style={{ backgroundColor: colorFor(value), opacity: 0.35 + value / 150 }}
                  >
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">
                      {value}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
        <span>Low</span>
        <div className="h-2 w-24 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" />
        <span>Severe</span>
      </div>
    </div>
  );
}

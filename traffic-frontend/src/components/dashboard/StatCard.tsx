import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DynamicIcon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { StatCard as StatCardType } from "@/types";

export function StatCard({ stat, index }: { stat: StatCardType; index: number }) {
  const positive = stat.trend === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden p-5",
          "bg-gradient-to-br",
          stat.accent,
        )}
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-opacity group-hover:opacity-80" />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-foreground backdrop-blur">
            <DynamicIcon name={stat.icon} className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5 font-semibold",
              positive ? "text-emerald-400" : "text-red-400",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(stat.change)}%
          </span>
          <span className="text-muted-foreground">vs last hour</span>
        </div>
      </Card>
    </motion.div>
  );
}

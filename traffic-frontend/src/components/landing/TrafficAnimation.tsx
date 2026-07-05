import { motion } from "framer-motion";

const roads = [
  "M20 60 H380",
  "M20 120 H380",
  "M20 180 H380",
  "M100 20 V220",
  "M200 20 V220",
  "M300 20 V220",
];

const cars = [
  { path: "M20 60 H380", color: "#38bdf8", dur: 4, delay: 0 },
  { path: "M380 120 H20", color: "#a78bfa", dur: 5, delay: 0.6 },
  { path: "M20 180 H380", color: "#34d399", dur: 3.4, delay: 1.2 },
  { path: "M100 220 V20", color: "#fbbf24", dur: 4.4, delay: 0.3 },
  { path: "M200 20 V220", color: "#f87171", dur: 3.8, delay: 0.9 },
  { path: "M300 220 V20", color: "#22d3ee", dur: 4.8, delay: 1.5 },
];

export function TrafficAnimation() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-transparent to-violet-500/20 blur-2xl" />
      <div className="glass-card relative overflow-hidden p-6">
        <svg viewBox="0 0 400 240" className="w-full">
          {roads.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="hsl(var(--border))"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          ))}
          {roads.map((d, i) => (
            <path
              key={`dash-${i}`}
              d={d}
              stroke="hsl(var(--muted-foreground) / 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              fill="none"
            />
          ))}

          {cars.map((car, i) => (
            <motion.circle
              key={i}
              r="6"
              fill={car.color}
              style={{ offsetPath: `path("${car.path}")`, offsetRotate: "auto" }}
              animate={{ offsetDistance: ["0%", "100%"] }}
              transition={{
                duration: car.dur,
                delay: car.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${car.dur}s`}
                repeatCount="indefinite"
                begin={`${car.delay}s`}
              />
            </motion.circle>
          ))}

          {[
            { x: 100, y: 60 },
            { x: 200, y: 120 },
            { x: 300, y: 180 },
          ].map((node, i) => (
            <g key={`node-${i}`}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="10"
                fill="hsl(var(--primary) / 0.2)"
                animate={{ r: [8, 18, 8], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }}
              />
              <circle cx={node.x} cy={node.y} r="4" fill="hsl(var(--primary))" />
            </g>
          ))}
        </svg>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Flow", value: "68%", color: "text-sky-400" },
            { label: "AI Conf.", value: "94.7%", color: "text-violet-400" },
            { label: "Alerts", value: "17", color: "text-rose-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 p-3">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

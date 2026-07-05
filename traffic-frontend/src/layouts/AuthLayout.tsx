import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const highlights = [
  { icon: Sparkles, text: "AI congestion prediction with 94.7% accuracy" },
  { icon: Activity, text: "Real-time monitoring across 142 live cameras" },
  { icon: TrendingUp, text: "Actionable analytics and route optimisation" },
  { icon: ShieldCheck, text: "Enterprise-grade security & role management" },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-10 lg:flex">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold leading-tight"
          >
            Predict congestion <span className="gradient-text">before</span> it
            happens.
          </motion.h1>
          <p className="max-w-md text-muted-foreground">
            An AI-powered command center for smart-city mobility — forecast
            traffic, monitor incidents, and keep the city moving.
          </p>
          <div className="space-y-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <h.icon className="h-4 w-4 text-primary" />
                </span>
                {h.text}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} TrafficAI. Built for smart cities.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <Outlet />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

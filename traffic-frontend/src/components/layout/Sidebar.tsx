import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navSections } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-card/70 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {section.title}
                </p>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-active"
                              className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                            />
                          )}
                          <item.icon className="h-[18px] w-[18px]" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-gradient-to-br from-sky-500/15 to-violet-500/15 p-4">
            <p className="text-sm font-semibold">AI Engine</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Models synced · 94.7% accuracy
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live inference active
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

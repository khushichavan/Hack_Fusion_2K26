import { ReactNode, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight, Droplets, LogOut } from "lucide-react";
import { clearUser, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function DashboardLayout({
  items,
  title,
  children,
}: {
  items: NavItem[];
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    clearUser();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(19,166,166,0.14),transparent_34%),linear-gradient(135deg,var(--color-background),var(--color-muted))]">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-white/10 bg-sidebar/95 text-sidebar-foreground shadow-[var(--shadow-soft)] backdrop-blur-xl transition-all md:flex",
          collapsed ? "w-20" : "w-72",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Droplets className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <span className="block font-semibold tracking-tight">AquaResolve AI</span>
              <span className="text-[10px] uppercase text-sidebar-foreground/50">
                Smart city water
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="ml-auto rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((it) => {
            const active = path === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                title={it.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center",
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && it.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className={cn(
            "m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4" /> {!collapsed && "Logout"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card/75 px-6 shadow-sm backdrop-blur-xl">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <div className="font-medium">{user?.name ?? "Guest"}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role ?? "user"}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {(user?.name ?? "G").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="page-enter flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

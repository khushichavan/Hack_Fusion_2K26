import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SearchBox } from "@/components/common/SearchBox";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { flatNav } from "@/config/navigation";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const results = flatNav.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block">
        <Breadcrumb />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="hidden h-10 w-56 justify-start gap-2 text-muted-foreground md:flex"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Quick search…</span>
              <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </Button>
          </DialogTrigger>
          <DialogContent className="top-[20%] translate-y-0">
            <DialogHeader>
              <DialogTitle>Quick search</DialogTitle>
            </DialogHeader>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search pages, routes, alerts…"
            />
            <div className="max-h-72 space-y-1 overflow-auto">
              {results.map((r) => (
                <button
                  key={r.to}
                  onClick={() => navigate(r.to)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                >
                  <r.icon className="h-4 w-4 text-muted-foreground" />
                  {r.label}
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results for “{query}”
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <ProfileMenu />
      </div>
    </header>
  );
}

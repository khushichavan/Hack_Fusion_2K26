import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { alerts } from "@/data/mockData";
import { alertTypeMeta, priorityMeta } from "@/lib/traffic";

export function NotificationBell() {
  const [items, setItems] = useState(alerts.slice(0, 6));
  const unread = items.filter((i) => !i.resolved).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unread} unread alerts
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              setItems((prev) => prev.map((i) => ({ ...i, resolved: true })))
            }
          >
            <Check className="h-3.5 w-3.5" /> Mark all
          </Button>
        </div>
        <Separator />
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, resolved: true } : i,
                    ),
                  )
                }
                className="flex gap-3 border-b border-white/5 p-4 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: priorityMeta[item.priority].hex }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {alertTypeMeta[item.type].label} · {item.location}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDateTime(item.timestamp)}
                  </p>
                </div>
                {!item.resolved && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

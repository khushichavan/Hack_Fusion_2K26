import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Eye, EyeOff, Inbox, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setState, useStore, getSession } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsPage,
});

type Filter = "all" | "unread" | "read";

function NotificationsPage() {
  const session = getSession();
  const [filter, setFilter] = useState<Filter>("all");
  const notifications = useStore((s) => s.notifications);
  const items = useMemo(
    () => notifications.filter((n) => !n.forEmail || n.forEmail === session?.email),
    [notifications, session?.email],
  );
  const unread = items.filter((n) => !n.read).length;
  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.read);
    if (filter === "read") return items.filter((n) => n.read);
    return items;
  }, [filter, items]);

  const markAll = () => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    toast.success("All notifications marked as read");
  };

  const toggleRead = (id: string, read: boolean) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read } : n)),
    }));
  };

  const remove = (id: string) => {
    setState((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) }));
    toast.success("Notification removed");
  };

  const clearRead = () => {
    setState((s) => ({ ...s, notifications: s.notifications.filter((n) => !n.read) }));
    toast.success("Read notifications cleared");
  };

  return (
    <div className="page-enter space-y-6">
      <Card className="interactive-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notification center
            </div>
            <h3 className="mt-1 text-xl font-semibold">Updates and alerts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Track request decisions, expiry alerts, and system broadcasts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={markAll}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
            <Button variant="outline" onClick={clearRead}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear read
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Summary label="Total" value={items.length} />
          <Summary label="Unread" value={unread} tone="primary" />
          <Summary label="Read" value={items.length - unread} />
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "unread", "read"] as Filter[]).map((option) => (
              <Button
                key={option}
                variant={filter === option ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option)}
                className="capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
          <Badge variant="secondary">{visible.length} shown</Badge>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <Inbox className="mx-auto mb-3 h-8 w-8" />
            No notifications in this view.
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((notification) => (
              <li
                key={notification.id}
                className={`interactive-card flex items-start gap-3 rounded-lg border p-4 ${notification.read ? "bg-background" : "bg-primary/5"}`}
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${notification.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{notification.title}</div>
                    {!notification.read && (
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                        New
                      </Badge>
                    )}
                    {!notification.forEmail && <Badge variant="outline">Broadcast</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleRead(notification.id, !notification.read)}
                    title={notification.read ? "Mark unread" : "Mark read"}
                  >
                    {notification.read ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(notification.id)}
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone?: "primary" }) {
  return (
    <div
      className={`rounded-lg border p-4 ${tone === "primary" ? "border-primary/30 bg-primary/5" : "bg-muted/30"}`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

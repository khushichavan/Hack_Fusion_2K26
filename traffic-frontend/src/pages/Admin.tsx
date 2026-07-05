import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Cctv,
  Plus,
  Route as RouteIcon,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CongestionBadge } from "@/components/common/CongestionBadge";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useAsync } from "@/hooks/useAsync";
import { adminApi, analyticsApi } from "@/services/mockApi";
import {
  alerts as allAlerts,
  cameras as allCameras,
  predictions as allPredictions,
  roads as allRoads,
} from "@/data/mockData";
import { alertTypeMeta, priorityMeta } from "@/lib/traffic";
import { formatDate } from "@/lib/utils";

export default function Admin() {
  const { data: users } = useAsync(() => adminApi.listUsers(), []);
  const analytics = useAsync(() => analyticsApi.getSummary(), []);
  const [userList, setUserList] = useState(users ?? []);

  const rows = userList.length ? userList : users ?? [];

  const overview = [
    { label: "Total Users", value: rows.length, icon: Users, accent: "from-sky-500/20 to-cyan-500/10" },
    { label: "Cameras", value: allCameras.length, icon: Cctv, accent: "from-violet-500/20 to-fuchsia-500/10" },
    { label: "Roads", value: allRoads.length, icon: RouteIcon, accent: "from-emerald-500/20 to-teal-500/10" },
    { label: "Predictions", value: allPredictions.length, icon: Sparkles, accent: "from-amber-500/20 to-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users, infrastructure and system data."
        actions={
          <Button variant="gradient" onClick={() => toast.success("New record created")}>
            <Plus className="h-4 w-4" /> Add New
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overview.map((o, i) => (
          <motion.div
            key={o.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`bg-gradient-to-br p-5 ${o.accent}`}>
              <o.icon className="h-5 w-5 text-foreground/80" />
              <p className="mt-3 text-2xl font-bold">{o.value}</p>
              <p className="text-xs text-muted-foreground">{o.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            { v: "users", label: "Users", icon: Users },
            { v: "cameras", label: "Cameras", icon: Cctv },
            { v: "roads", label: "Roads", icon: RouteIcon },
            { v: "alerts", label: "Alerts", icon: Bell },
            { v: "predictions", label: "Predictions", icon: Sparkles },
            { v: "analytics", label: "Analytics", icon: BarChart3 },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="gap-1.5 border border-white/5 data-[state=active]:border-primary/30"
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell capitalize">
                        <Badge variant="secondary">{u.role}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.status === "active"
                              ? "success"
                              : u.status === "inactive"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setUserList(rows.filter((r) => r.id !== u.id));
                            toast.success(`Removed ${u.name}`);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Camera</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Density</TableHead>
                    <TableHead>FPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCameras.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {c.location}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.status === "online" ? "success" : c.status === "offline" ? "destructive" : "warning"}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <CongestionBadge level={c.density} />
                      </TableCell>
                      <TableCell>{c.fps}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roads">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Road</TableHead>
                    <TableHead className="hidden md:table-cell">Zone</TableHead>
                    <TableHead>Congestion</TableHead>
                    <TableHead className="hidden lg:table-cell">Avg Speed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRoads.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {r.zone}
                      </TableCell>
                      <TableCell>
                        <CongestionBadge level={r.congestion} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {r.avgSpeed} km/h
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.status === "open" ? "success" : r.status === "restricted" ? "warning" : "destructive"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAlerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {alertTypeMeta[a.type].label}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium" style={{ color: priorityMeta[a.priority].hex }}>
                          {priorityMeta[a.priority].label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {a.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.resolved ? "success" : "warning"}>
                          {a.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Congestion</TableHead>
                    <TableHead className="hidden md:table-cell">Confidence</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPredictions.slice(0, 12).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.id}
                      </TableCell>
                      <TableCell className="font-medium">{p.route}</TableCell>
                      <TableCell>
                        <CongestionBadge level={p.congestion} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.confidence}%
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={p.status === "completed" ? "success" : p.status === "processing" ? "warning" : "destructive"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6">
              {analytics.data && (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={analytics.data.dailyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <RTooltip content={<ChartTooltip />} />
                    <Bar dataKey="volume" name="Traffic Volume" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

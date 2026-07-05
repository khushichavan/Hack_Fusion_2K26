import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchBox } from "@/components/common/SearchBox";
import { CongestionBadge } from "@/components/common/CongestionBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAsync } from "@/hooks/useAsync";
import { useDebounce } from "@/hooks/useDebounce";
import { predictionApi } from "@/services/mockApi";
import { exportToCsv, exportToPdf } from "@/utils/export";
import { formatDateTime } from "@/lib/utils";
import type { CongestionLevel, Prediction } from "@/types";

const PAGE_SIZE = 8;

export default function History() {
  const { data, loading } = useAsync(() => predictionApi.list(), []);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<CongestionLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Prediction["status"] | "all">("all");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const filtered = useMemo(() => {
    return (data ?? []).filter(
      (p) =>
        (debounced === "" ||
          p.route.toLowerCase().includes(debounced.toLowerCase()) ||
          p.id.toLowerCase().includes(debounced.toLowerCase())) &&
        (levelFilter === "all" || p.congestion === levelFilter) &&
        (statusFilter === "all" || p.status === statusFilter),
    );
  }, [data, debounced, levelFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const columns = [
    { key: "id" as const, header: "ID" },
    { key: "route" as const, header: "Route" },
    { key: "congestion" as const, header: "Congestion" },
    { key: "confidence" as const, header: "Confidence" },
    { key: "travelTime" as const, header: "Travel Time (min)" },
    { key: "distance" as const, header: "Distance (km)" },
    { key: "timestamp" as const, header: "Timestamp" },
  ];

  const handleCsv = () => {
    exportToCsv("prediction-history", filtered, columns);
    toast.success("Exported CSV", { description: `${filtered.length} records` });
  };
  const handlePdf = () => {
    exportToPdf("prediction-history", "Prediction History", filtered, columns);
    toast.success("Exported PDF", { description: `${filtered.length} records` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prediction History"
        description="Search, filter and export past AI predictions."
        actions={
          <>
            <Button variant="outline" onClick={handleCsv}>
              <FileDown className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={handlePdf}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by route or ID…"
            />
            <Select
              value={levelFilter}
              onValueChange={(v) => {
                setLevelFilter(v as CongestionLevel | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Congestion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as Prediction["status"] | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pageRows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No predictions found"
                description="Try adjusting your search or filters."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Congestion</TableHead>
                  <TableHead className="hidden md:table-cell">Confidence</TableHead>
                  <TableHead className="hidden md:table-cell">ETA</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
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
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {p.travelTime} min
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={
                          p.status === "completed"
                            ? "success"
                            : p.status === "processing"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDateTime(p.timestamp)}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

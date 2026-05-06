import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  setState,
  useStore,
  recalcAllocation,
  addLog,
  uid,
  type Area,
  type Category,
  type Priority,
} from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/demand")({
  component: DemandMgmt,
});

function DemandMgmt() {
  const list = useStore((s) => s.areas);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Area | null>(null);
  const [newRow, setNewRow] = useState({
    name: "",
    category: "Residential" as Category,
    demand: 100,
    priority: "medium" as Priority,
  });

  const add = () => {
    if (!newRow.name) return toast.error("Name required");
    const a: Area = {
      id: uid(),
      name: newRow.name,
      category: newRow.category,
      demand: newRow.demand,
      priority: newRow.priority,
      allocated: 0,
      status: "No Supply",
      justification: "",
    };
    setState((s) => ({ ...s, areas: [...s.areas, a] }));
    addLog("Admin", `Added area ${a.name}`);
    recalcAllocation("Admin");
    setNewRow({ name: "", category: "Residential", demand: 100, priority: "medium" });
    toast.success("Area added");
  };

  const save = (a: Area) => {
    if (!draft) return;
    setState((s) => ({ ...s, areas: s.areas.map((x) => (x.id === a.id ? draft : x)) }));
    addLog("Admin", `Edited area ${draft.name}`);
    recalcAllocation("Admin");
    setEditing(null);
    toast.success("Saved");
  };

  const del = (id: string, name: string) => {
    setState((s) => ({ ...s, areas: s.areas.filter((x) => x.id !== id) }));
    addLog("Admin", `Deleted area ${name}`);
    recalcAllocation("Admin");
    toast.success("Deleted");
  };

  return (
    <Card className="p-6">
      <div className="mb-6 grid gap-3 md:grid-cols-5">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Area name</label>
          <Input
            placeholder="New area name"
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={newRow.category}
            onValueChange={(v) => setNewRow({ ...newRow, category: v as Category })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hospital">Hospital</SelectItem>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Industry">Industry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Demand (ML)</label>
          <Input
            type="number"
            value={newRow.demand}
            onChange={(e) => setNewRow({ ...newRow, demand: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={newRow.priority}
            onValueChange={(v) => setNewRow({ ...newRow, priority: v as Priority })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-5">
          <Button onClick={add}>
            <Plus className="mr-2 h-4 w-4" /> Add area
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Area</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Demand</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                {editing === a.id && draft ? (
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                ) : (
                  a.name
                )}
              </TableCell>
              <TableCell>
                {editing === a.id && draft ? (
                  <Select
                    value={draft.category}
                    onValueChange={(v) => setDraft({ ...draft, category: v as Category })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Industry">Industry</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  a.category
                )}
              </TableCell>
              <TableCell>
                {editing === a.id && draft ? (
                  <Input
                    type="number"
                    value={draft.demand}
                    onChange={(e) => setDraft({ ...draft, demand: Number(e.target.value) })}
                  />
                ) : (
                  `${a.demand} ML`
                )}
              </TableCell>
              <TableCell className="capitalize">
                {editing === a.id && draft ? (
                  <Select
                    value={draft.priority}
                    onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  a.priority
                )}
              </TableCell>
              <TableCell className="text-right">
                {editing === a.id && draft ? (
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => save(a)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(a.id);
                        setDraft(a);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(a.id, a.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

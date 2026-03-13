import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Container, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ShipmentStatus, type UserProfile } from "../backend.d";
import { ShipmentStatusBadge } from "../components/StatusBadge";
import {
  useCreateShipment,
  useShipments,
  useUpdateShipmentStatus,
} from "../hooks/useQueries";

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusOptions = [
  { value: ShipmentStatus.inTransit, label: "In Transit" },
  { value: ShipmentStatus.customsHold, label: "Customs Hold" },
  { value: ShipmentStatus.cleared, label: "Cleared" },
  { value: ShipmentStatus.delivered, label: "Delivered" },
];

interface CargoPageProps {
  profile: UserProfile;
}

export function CargoPage({ profile: _profile }: CargoPageProps) {
  const { data: shipments = [], isLoading } = useShipments();
  const createShipment = useCreateShipment();
  const updateStatus = useUpdateShipmentStatus();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    containerNumber: "",
    origin: "",
    destination: "",
    shipper: "",
    consignee: "",
    vesselName: "",
    status: ShipmentStatus.inTransit,
    eta: "",
  });

  const filtered = shipments.filter(
    (s) =>
      s.containerNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.vesselName.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const etaMs = form.eta
        ? BigInt(new Date(form.eta).getTime()) * BigInt(1_000_000)
        : BigInt(Date.now()) * BigInt(1_000_000);
      await createShipment.mutateAsync({
        ...form,
        eta: etaMs,
      });
      toast.success("Shipment created successfully");
      setOpen(false);
      setForm({
        containerNumber: "",
        origin: "",
        destination: "",
        shipper: "",
        consignee: "",
        vesselName: "",
        status: ShipmentStatus.inTransit,
        eta: "",
      });
    } catch {
      toast.error("Failed to create shipment");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Cargo Tracking
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {shipments.length} shipments total
          </p>
        </div>
        <Button
          data-ocid="cargo.add.primary_button"
          onClick={() => setOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Shipment
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="cargo.search_input"
          placeholder="Search by container, vessel, route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="cargo.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="cargo.empty_state">
              <Container className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">
                No shipments found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {search
                  ? "Try a different search term"
                  : "Add your first shipment to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="cargo.list.table">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold text-xs">
                      Container #
                    </TableHead>
                    <TableHead className="font-semibold text-xs">
                      Vessel
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">
                      Shipper
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">
                      Route
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">
                      ETA
                    </TableHead>
                    <TableHead className="font-semibold text-xs">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-right">
                      Update
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s, idx) => (
                    <TableRow
                      key={s.id.toString()}
                      data-ocid={`cargo.item.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs font-semibold">
                        {s.containerNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {s.vesselName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {s.shipper}
                      </TableCell>
                      <TableCell className="text-xs hidden md:table-cell">
                        <span className="text-muted-foreground">
                          {s.origin}
                        </span>
                        <span className="mx-1">→</span>
                        <span className="text-muted-foreground">
                          {s.destination}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">
                        {formatTime(s.eta)}
                      </TableCell>
                      <TableCell>
                        <ShipmentStatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={s.status}
                          onValueChange={async (v) => {
                            try {
                              await updateStatus.mutateAsync({
                                id: s.id,
                                status: v as ShipmentStatus,
                              });
                              toast.success("Status updated");
                            } catch {
                              toast.error("Failed to update status");
                            }
                          }}
                        >
                          <SelectTrigger
                            data-ocid={`cargo.item.${idx + 1}`}
                            className="h-7 w-32 text-xs"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Shipment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" data-ocid="cargo.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Shipment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Container #</Label>
                <Input
                  data-ocid="cargo.input"
                  placeholder="MSCU1234567"
                  value={form.containerNumber}
                  onChange={(e) =>
                    setForm({ ...form, containerNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Vessel Name</Label>
                <Input
                  placeholder="MSC Paloma"
                  value={form.vesselName}
                  onChange={(e) =>
                    setForm({ ...form, vesselName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Origin</Label>
                <Input
                  placeholder="Shanghai, China"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Destination</Label>
                <Input
                  placeholder="Rotterdam, NL"
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Shipper</Label>
                <Input
                  placeholder="Pacific Trade Corp"
                  value={form.shipper}
                  onChange={(e) =>
                    setForm({ ...form, shipper: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Consignee</Label>
                <Input
                  placeholder="Euro Import GmbH"
                  value={form.consignee}
                  onChange={(e) =>
                    setForm({ ...form, consignee: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as ShipmentStatus })
                  }
                >
                  <SelectTrigger data-ocid="cargo.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">ETA</Label>
                <Input
                  type="date"
                  value={form.eta}
                  onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="cargo.cancel_button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="cargo.submit_button"
                disabled={createShipment.isPending}
              >
                {createShipment.isPending ? "Creating..." : "Create Shipment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

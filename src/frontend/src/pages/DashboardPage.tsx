import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Container,
  FileText,
  MessageSquare,
  Ship,
  TrendingUp,
} from "lucide-react";
import { DocumentStatus, ShipmentStatus, type UserProfile } from "../backend.d";
import { FlipCard } from "../components/FlipCard";
import { ShipmentStatusBadge } from "../components/StatusBadge";
import { useDocuments, useMessages, useShipments } from "../hooks/useQueries";

interface DashboardPageProps {
  profile: UserProfile;
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DashboardPage({ profile }: DashboardPageProps) {
  const { data: shipments = [], isLoading: loadingShipments } = useShipments();
  const { data: documents = [], isLoading: loadingDocs } = useDocuments();
  const { data: messages = [], isLoading: loadingMsgs } = useMessages();

  const activeCount = shipments.filter(
    (s) =>
      s.status === ShipmentStatus.inTransit ||
      s.status === ShipmentStatus.customsHold,
  ).length;
  const pendingDocs = documents.filter(
    (d) => d.status === DocumentStatus.pending,
  ).length;
  const unreadMsgs = messages.filter((m) => !m.isRead).length;
  const totalVessels = [...new Set(shipments.map((s) => s.vesselName))].length;

  const shipmentByStatus = {
    [ShipmentStatus.inTransit]: shipments.filter(
      (s) => s.status === ShipmentStatus.inTransit,
    ).length,
    [ShipmentStatus.customsHold]: shipments.filter(
      (s) => s.status === ShipmentStatus.customsHold,
    ).length,
    [ShipmentStatus.cleared]: shipments.filter(
      (s) => s.status === ShipmentStatus.cleared,
    ).length,
    [ShipmentStatus.delivered]: shipments.filter(
      (s) => s.status === ShipmentStatus.delivered,
    ).length,
  };

  const docByStatus = {
    [DocumentStatus.pending]: documents.filter(
      (d) => d.status === DocumentStatus.pending,
    ).length,
    [DocumentStatus.approved]: documents.filter(
      (d) => d.status === DocumentStatus.approved,
    ).length,
    [DocumentStatus.rejected]: documents.filter(
      (d) => d.status === DocumentStatus.rejected,
    ).length,
  };

  const flipCards = [
    {
      icon: Ship,
      label: "Vessels in Port",
      value: totalVessels,
      gradient: "from-navy-700 to-navy-800",
      front: (
        <div className="h-full bg-gradient-to-br from-navy-700 to-navy-800 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm font-medium">
              Vessels in Port
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white">
              {loadingShipments ? (
                <Skeleton className="h-10 w-16 bg-white/20" />
              ) : (
                totalVessels
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">Tap to see details</p>
          </div>
        </div>
      ),
      back: (
        <div className="h-full bg-gradient-to-br from-navy-700 to-navy-800 p-6 flex flex-col justify-between">
          <span className="text-white/60 text-sm font-medium">
            Vessel Breakdown
          </span>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">In Transit</span>
              <span className="text-white font-bold">
                {shipmentByStatus[ShipmentStatus.inTransit]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Customs Hold</span>
              <span className="text-amber-300 font-bold">
                {shipmentByStatus[ShipmentStatus.customsHold]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Cleared</span>
              <span className="text-green-300 font-bold">
                {shipmentByStatus[ShipmentStatus.cleared]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Delivered</span>
              <span className="text-white/50 font-bold">
                {shipmentByStatus[ShipmentStatus.delivered]}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: FileText,
      label: "Pending Documents",
      value: pendingDocs,
      front: (
        <div className="h-full bg-gradient-to-br from-amber-600 to-orange-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">
              Pending Docs
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white">
              {loadingDocs ? (
                <Skeleton className="h-10 w-16 bg-white/20" />
              ) : (
                pendingDocs
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">Awaiting review</p>
          </div>
        </div>
      ),
      back: (
        <div className="h-full bg-gradient-to-br from-amber-600 to-orange-700 p-6 flex flex-col justify-between">
          <span className="text-white/70 text-sm font-medium">
            Document Status
          </span>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Pending</span>
              <span className="text-amber-200 font-bold">
                {docByStatus[DocumentStatus.pending]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Approved</span>
              <span className="text-green-200 font-bold">
                {docByStatus[DocumentStatus.approved]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Rejected</span>
              <span className="text-red-200 font-bold">
                {docByStatus[DocumentStatus.rejected]}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Container,
      label: "Active Cargo",
      value: activeCount,
      front: (
        <div className="h-full bg-gradient-to-br from-teal-600 to-teal-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">
              Active Cargo
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white">
              {loadingShipments ? (
                <Skeleton className="h-10 w-16 bg-white/20" />
              ) : (
                activeCount
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">In transit + on hold</p>
          </div>
        </div>
      ),
      back: (
        <div className="h-full bg-gradient-to-br from-teal-600 to-teal-700 p-6 flex flex-col justify-between">
          <span className="text-white/70 text-sm font-medium">
            Active Breakdown
          </span>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">In Transit</span>
              <span className="text-white font-bold">
                {shipmentByStatus[ShipmentStatus.inTransit]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Customs Hold</span>
              <span className="text-amber-200 font-bold">
                {shipmentByStatus[ShipmentStatus.customsHold]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Total Shipments</span>
              <span className="text-white font-bold">{shipments.length}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: MessageSquare,
      label: "Unread Messages",
      value: unreadMsgs,
      front: (
        <div className="h-full bg-gradient-to-br from-violet-600 to-purple-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">
              Unread Messages
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white">
              {loadingMsgs ? (
                <Skeleton className="h-10 w-16 bg-white/20" />
              ) : (
                unreadMsgs
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">Require attention</p>
          </div>
        </div>
      ),
      back: (
        <div className="h-full bg-gradient-to-br from-violet-600 to-purple-700 p-6 flex flex-col justify-between">
          <span className="text-white/70 text-sm font-medium">
            Message Summary
          </span>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Unread</span>
              <span className="text-amber-200 font-bold">{unreadMsgs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Total</span>
              <span className="text-white font-bold">{messages.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Read</span>
              <span className="text-white/50 font-bold">
                {messages.length - unreadMsgs}
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Good day, {profile.name.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening at the port today.
        </p>
      </div>

      {/* KPI Flip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {flipCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
          >
            <FlipCard front={card.front} back={card.back} />
          </div>
        ))}
      </div>

      {/* Recent Shipments */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Recent Shipments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingShipments ? (
            <div className="p-6 space-y-3" data-ocid="cargo.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : shipments.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground"
              data-ocid="cargo.empty_state"
            >
              <Container className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No shipments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold text-xs">
                      Container
                    </TableHead>
                    <TableHead className="font-semibold text-xs">
                      Vessel
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.slice(0, 6).map((s, idx) => (
                    <TableRow
                      key={s.id.toString()}
                      data-ocid={`cargo.item.${idx + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-mono text-xs font-semibold">
                        {s.containerNumber}
                      </TableCell>
                      <TableCell className="text-sm">{s.vesselName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {s.origin} → {s.destination}
                      </TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">
                        {formatTime(s.eta)}
                      </TableCell>
                      <TableCell>
                        <ShipmentStatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

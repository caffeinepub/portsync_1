import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Container, FileText, MessageSquare } from "lucide-react";
import { DocumentStatus, ShipmentStatus } from "../backend.d";
import {
  useDocuments,
  useMessages,
  useReports,
  useShipments,
} from "../hooks/useQueries";

const shipmentStatusConfig = [
  {
    status: ShipmentStatus.inTransit,
    label: "In Transit",
    color: "bg-blue-500",
    textColor: "text-blue-700",
  },
  {
    status: ShipmentStatus.customsHold,
    label: "Customs Hold",
    color: "bg-amber-500",
    textColor: "text-amber-700",
  },
  {
    status: ShipmentStatus.cleared,
    label: "Cleared",
    color: "bg-green-500",
    textColor: "text-green-700",
  },
  {
    status: ShipmentStatus.delivered,
    label: "Delivered",
    color: "bg-slate-400",
    textColor: "text-slate-600",
  },
];

const docStatusConfig = [
  {
    status: DocumentStatus.pending,
    label: "Pending",
    color: "bg-amber-500",
    textColor: "text-amber-700",
  },
  {
    status: DocumentStatus.approved,
    label: "Approved",
    color: "bg-green-500",
    textColor: "text-green-700",
  },
  {
    status: DocumentStatus.rejected,
    label: "Rejected",
    color: "bg-red-500",
    textColor: "text-red-700",
  },
];

export function ReportsPage() {
  const { isLoading } = useReports();
  const { data: shipments = [] } = useShipments();
  const { data: documents = [] } = useDocuments();
  const { data: messages = [] } = useMessages();

  const totalShipments = shipments.length;
  const totalDocs = documents.length;
  const totalMsgs = messages.length;

  const shipmentCounts = shipmentStatusConfig.map((cfg) => ({
    ...cfg,
    count: shipments.filter((s) => s.status === cfg.status).length,
  }));

  const docCounts = docStatusConfig.map((cfg) => ({
    ...cfg,
    count: documents.filter((d) => d.status === cfg.status).length,
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Reports & Analytics
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Port operations summary
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Container,
            label: "Total Shipments",
            value: totalShipments,
            sub: `${shipmentCounts.find((s) => s.status === ShipmentStatus.inTransit)?.count ?? 0} in transit`,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: FileText,
            label: "Total Documents",
            value: totalDocs,
            sub: `${docCounts.find((d) => d.status === DocumentStatus.pending)?.count ?? 0} pending review`,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            icon: MessageSquare,
            label: "Total Messages",
            value: isLoading ? "—" : totalMsgs,
            sub: `${messages.filter((m) => !m.isRead).length} unread`,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <Card key={label} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {label}
                  </p>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-7 w-12" /> : value}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Shipments by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div data-ocid="reports.loading_state">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full mb-3" />
                ))}
              </div>
            ) : (
              shipmentCounts.map(
                ({ status, label, color, textColor, count }) => (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-semibold ${textColor}`}>
                        {label}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {count} / {totalShipments}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{
                          width: totalShipments
                            ? `${(count / totalShipments) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                ),
              )
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              Documents by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div data-ocid="reports.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full mb-3" />
                ))}
              </div>
            ) : (
              docCounts.map(({ status, label, color, textColor, count }) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-semibold ${textColor}`}>
                      {label}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {count} / {totalDocs}
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{
                        width: totalDocs
                          ? `${(count / totalDocs) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Operational Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Clearance Rate",
                value:
                  totalShipments > 0
                    ? `${Math.round((((shipmentCounts.find((s) => s.status === ShipmentStatus.cleared)?.count ?? 0) + (shipmentCounts.find((s) => s.status === ShipmentStatus.delivered)?.count ?? 0)) / totalShipments) * 100)}%`
                    : "0%",
                desc: "Cleared + Delivered",
              },
              {
                label: "Doc Approval Rate",
                value:
                  totalDocs > 0
                    ? `${Math.round(((docCounts.find((d) => d.status === DocumentStatus.approved)?.count ?? 0) / totalDocs) * 100)}%`
                    : "0%",
                desc: "Of submitted docs",
              },
              {
                label: "Customs Hold Rate",
                value:
                  totalShipments > 0
                    ? `${Math.round(((shipmentCounts.find((s) => s.status === ShipmentStatus.customsHold)?.count ?? 0) / totalShipments) * 100)}%`
                    : "0%",
                desc: "Awaiting customs",
              },
              {
                label: "Msg Response Rate",
                value:
                  totalMsgs > 0
                    ? `${Math.round((messages.filter((m) => m.isRead).length / totalMsgs) * 100)}%`
                    : "0%",
                desc: "Messages read",
              },
            ].map(({ label, value, desc }) => (
              <div key={label} className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  {label}
                </p>
                <div className="text-2xl font-display font-bold text-foreground mt-1">
                  {value}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

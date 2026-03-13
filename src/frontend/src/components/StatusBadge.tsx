import { Badge } from "@/components/ui/badge";
import { DocumentStatus, ShipmentStatus } from "../backend.d";

const shipmentColors: Record<ShipmentStatus, string> = {
  [ShipmentStatus.inTransit]: "bg-blue-100 text-blue-800 border-blue-200",
  [ShipmentStatus.customsHold]: "bg-amber-100 text-amber-800 border-amber-200",
  [ShipmentStatus.cleared]: "bg-green-100 text-green-800 border-green-200",
  [ShipmentStatus.delivered]: "bg-slate-100 text-slate-700 border-slate-200",
};

const shipmentLabels: Record<ShipmentStatus, string> = {
  [ShipmentStatus.inTransit]: "In Transit",
  [ShipmentStatus.customsHold]: "Customs Hold",
  [ShipmentStatus.cleared]: "Cleared",
  [ShipmentStatus.delivered]: "Delivered",
};

const docColors: Record<DocumentStatus, string> = {
  [DocumentStatus.pending]: "bg-amber-100 text-amber-800 border-amber-200",
  [DocumentStatus.approved]: "bg-green-100 text-green-800 border-green-200",
  [DocumentStatus.rejected]: "bg-red-100 text-red-800 border-red-200",
};

const docLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.pending]: "Pending",
  [DocumentStatus.approved]: "Approved",
  [DocumentStatus.rejected]: "Rejected",
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${shipmentColors[status]}`}
    >
      {shipmentLabels[status]}
    </Badge>
  );
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${docColors[status]}`}
    >
      {docLabels[status]}
    </Badge>
  );
}

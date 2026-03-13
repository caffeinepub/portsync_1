import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, FileText, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ActorRole,
  DocumentStatus,
  DocumentType,
  type UserProfile,
} from "../backend.d";
import { DocumentStatusBadge } from "../components/StatusBadge";
import {
  useCreateDocument,
  useDocuments,
  useShipments,
  useUpdateDocumentStatus,
} from "../hooks/useQueries";

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const docTypeLabels: Record<DocumentType, string> = {
  [DocumentType.manifest]: "Manifest",
  [DocumentType.billOfLading]: "Bill of Lading",
  [DocumentType.customsDeclaration]: "Customs Declaration",
};

interface DocumentsPageProps {
  profile: UserProfile;
}

export function DocumentsPage({ profile }: DocumentsPageProps) {
  const { data: documents = [], isLoading } = useDocuments();
  const { data: shipments = [] } = useShipments();
  const createDoc = useCreateDocument();
  const updateStatus = useUpdateDocumentStatus();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    title: "",
    docType: DocumentType.billOfLading,
    shipmentId: "",
    content: "",
  });

  const canApprove =
    profile.role === ActorRole.admin ||
    profile.role === ActorRole.customsOfficer;

  const filtered = documents.filter((d) => {
    if (activeTab === "all") return true;
    if (activeTab === "billOfLading")
      return d.docType === DocumentType.billOfLading;
    if (activeTab === "customsDeclaration")
      return d.docType === DocumentType.customsDeclaration;
    if (activeTab === "manifest") return d.docType === DocumentType.manifest;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sid = BigInt(form.shipmentId || "0");
      await createDoc.mutateAsync({
        title: form.title,
        docType: form.docType,
        shipmentId: sid,
        content: form.content,
      });
      toast.success("Document created");
      setOpen(false);
      setForm({
        title: "",
        docType: DocumentType.billOfLading,
        shipmentId: "",
        content: "",
      });
    } catch {
      toast.error("Failed to create document");
    }
  };

  const handleUpdateStatus = async (id: bigint, status: DocumentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Document ${status}`);
    } catch {
      toast.error("Failed to update document");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Documents
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {documents.length} documents total
          </p>
        </div>
        <Button
          data-ocid="docs.add.primary_button"
          onClick={() => setOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="all" data-ocid="docs.tab">
            All
          </TabsTrigger>
          <TabsTrigger value="billOfLading" data-ocid="docs.tab">
            Bill of Lading
          </TabsTrigger>
          <TabsTrigger value="customsDeclaration" data-ocid="docs.tab">
            Customs
          </TabsTrigger>
          <TabsTrigger value="manifest" data-ocid="docs.tab">
            Manifest
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="shadow-card">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3" data-ocid="docs.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center" data-ocid="docs.empty_state">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">
                    No documents found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="docs.list.table">
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="font-semibold text-xs">
                          Title
                        </TableHead>
                        <TableHead className="font-semibold text-xs">
                          Type
                        </TableHead>
                        <TableHead className="font-semibold text-xs hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-xs">
                          Status
                        </TableHead>
                        {canApprove && (
                          <TableHead className="font-semibold text-xs text-right">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((doc, idx) => (
                        <TableRow
                          key={doc.id.toString()}
                          data-ocid={`docs.item.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm max-w-[200px] truncate">
                            {doc.title}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">
                              {docTypeLabels[doc.docType]}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                            {formatTime(doc.createdAt)}
                          </TableCell>
                          <TableCell>
                            <DocumentStatusBadge status={doc.status} />
                          </TableCell>
                          {canApprove && (
                            <TableCell className="text-right">
                              {doc.status === DocumentStatus.pending && (
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-ocid={`docs.item.${idx + 1}`}
                                    className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50 gap-1"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        doc.id,
                                        DocumentStatus.approved,
                                      )
                                    }
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-ocid={`docs.item.${idx + 1}`}
                                    className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50 gap-1"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        doc.id,
                                        DocumentStatus.rejected,
                                      )
                                    }
                                  >
                                    <X className="w-3 h-3" /> Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Document Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" data-ocid="docs.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">New Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title</Label>
              <Input
                data-ocid="docs.input"
                placeholder="Bill of Lading for MSCU1234..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Document Type</Label>
              <Select
                value={form.docType}
                onValueChange={(v) =>
                  setForm({ ...form, docType: v as DocumentType })
                }
              >
                <SelectTrigger data-ocid="docs.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DocumentType.billOfLading}>
                    Bill of Lading
                  </SelectItem>
                  <SelectItem value={DocumentType.customsDeclaration}>
                    Customs Declaration
                  </SelectItem>
                  <SelectItem value={DocumentType.manifest}>
                    Manifest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Linked Shipment</Label>
              <Select
                value={form.shipmentId}
                onValueChange={(v) => setForm({ ...form, shipmentId: v })}
              >
                <SelectTrigger data-ocid="docs.select">
                  <SelectValue placeholder="Select shipment..." />
                </SelectTrigger>
                <SelectContent>
                  {shipments.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.containerNumber} – {s.vesselName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Content</Label>
              <Textarea
                data-ocid="docs.textarea"
                placeholder="Document details and notes..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="docs.cancel_button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="docs.submit_button"
                disabled={createDoc.isPending}
              >
                {createDoc.isPending ? "Creating..." : "Create Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ActorRole, type UserProfile } from "../backend.d";
import { useMessages, useSendMessage } from "../hooks/useQueries";

const roleLabels: Record<ActorRole, string> = {
  [ActorRole.admin]: "Admin",
  [ActorRole.customsOfficer]: "Customs",
  [ActorRole.shippingLine]: "Shipping",
  [ActorRole.portAgent]: "Port Agent",
};

const roleColors: Record<ActorRole, string> = {
  [ActorRole.admin]: "bg-purple-100 text-purple-700",
  [ActorRole.customsOfficer]: "bg-amber-100 text-amber-700",
  [ActorRole.shippingLine]: "bg-teal-100 text-teal-700",
  [ActorRole.portAgent]: "bg-blue-100 text-blue-700",
};

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessagesPageProps {
  profile: UserProfile;
}

export function MessagesPage({ profile }: MessagesPageProps) {
  const { data: messages = [], isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    toRole: ActorRole.portAgent as ActorRole,
    subject: "",
    content: "",
  });

  const roleOptions = [
    { value: ActorRole.admin, label: "Administrator" },
    { value: ActorRole.portAgent, label: "Port Agent" },
    { value: ActorRole.customsOfficer, label: "Customs Officer" },
    { value: ActorRole.shippingLine, label: "Shipping Line" },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage.mutateAsync({
        fromRole: profile.role,
        toRole: form.toRole,
        subject: form.subject,
        content: form.content,
      });
      toast.success("Message sent");
      setOpen(false);
      setForm({ toRole: ActorRole.portAgent, subject: "", content: "" });
    } catch {
      toast.error("Failed to send message");
    }
  };

  const sorted = [...messages].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Messages
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {messages.filter((m) => !m.isRead).length} unread
          </p>
        </div>
        <Button
          data-ocid="messages.compose.primary_button"
          onClick={() => setOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="messages.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="p-12 text-center" data-ocid="messages.empty_state">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((msg, idx) => {
            const isExpanded = expanded === msg.id.toString();
            return (
              <Card
                key={msg.id.toString()}
                data-ocid={`messages.item.${idx + 1}`}
                className={`shadow-card transition-shadow hover:shadow-card-hover cursor-pointer ${
                  !msg.isRead ? "border-l-4 border-l-accent" : ""
                }`}
                onClick={() =>
                  setExpanded(isExpanded ? null : msg.id.toString())
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {!msg.isRead && (
                        <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-semibold ${!msg.isRead ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {msg.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${roleColors[msg.fromRole]}`}
                          >
                            {roleLabels[msg.fromRole]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            →
                          </span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${roleColors[msg.toRole]}`}
                          >
                            {roleLabels[msg.toRole]}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-foreground leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Compose Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" data-ocid="messages.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Compose Message</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">To Role</Label>
              <Select
                value={form.toRole}
                onValueChange={(v) =>
                  setForm({ ...form, toRole: v as ActorRole })
                }
              >
                <SelectTrigger data-ocid="messages.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Subject</Label>
              <Input
                data-ocid="messages.input"
                placeholder="Re: Container inspection..."
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Message</Label>
              <Textarea
                data-ocid="messages.textarea"
                placeholder="Write your message..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="messages.cancel_button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="messages.submit_button"
                disabled={sendMessage.isPending}
              >
                {sendMessage.isPending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

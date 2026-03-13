import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActorRole,
  type Document,
  DocumentStatus,
  DocumentType,
  type Message,
  type ReportSummary,
  type Shipment,
  ShipmentStatus,
  type UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export type { Shipment, Document, Message, UserProfile, ReportSummary };
export { ShipmentStatus, DocumentStatus, DocumentType, ActorRole };

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useShipments() {
  const { actor, isFetching } = useActor();
  return useQuery<Shipment[]>({
    queryKey: ["shipments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listShipments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateShipment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      containerNumber: string;
      origin: string;
      destination: string;
      shipper: string;
      consignee: string;
      status: ShipmentStatus;
      vesselName: string;
      eta: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createShipment(
        data.containerNumber,
        data.origin,
        data.destination,
        data.shipper,
        data.consignee,
        data.status,
        data.vesselName,
        data.eta,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
  });
}

export function useUpdateShipmentStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ShipmentStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateShipmentStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
  });
}

export function useDocuments() {
  const { actor, isFetching } = useActor();
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDocuments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDocument() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      docType: DocumentType;
      title: string;
      shipmentId: bigint;
      content: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createDocument(
        data.docType,
        data.title,
        data.shipmentId,
        data.content,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useUpdateDocumentStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: DocumentStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateDocumentStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      fromRole: ActorRole;
      toRole: ActorRole;
      subject: string;
      content: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(
        data.fromRole,
        data.toRole,
        data.subject,
        data.content,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useReports() {
  const { actor, isFetching } = useActor();
  return useQuery<ReportSummary>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalMessages: BigInt(0),
          totalShipmentsByStatus: [],
          totalDocumentsByStatus: [],
        };
      }
      return actor.getReports();
    },
    enabled: !!actor && !isFetching,
  });
}

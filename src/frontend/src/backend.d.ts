import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Shipment {
    id: bigint;
    eta: Time;
    vesselName: string;
    shipper: string;
    status: ShipmentStatus;
    containerNumber: string;
    destination: string;
    createdAt: Time;
    origin: string;
    consignee: string;
}
export interface Document {
    id: bigint;
    status: DocumentStatus;
    title: string;
    content: string;
    createdAt: Time;
    createdBy: Principal;
    shipmentId: bigint;
    docType: DocumentType;
}
export interface Message {
    id: bigint;
    content: string;
    subject: string;
    isRead: boolean;
    toRole: ActorRole;
    timestamp: Time;
    fromRole: ActorRole;
}
export interface UserProfile {
    name: string;
    role: ActorRole;
}
export interface ReportSummary {
    totalMessages: bigint;
    totalShipmentsByStatus: Array<[ShipmentStatus, bigint]>;
    totalDocumentsByStatus: Array<[DocumentStatus, bigint]>;
}
export enum ActorRole {
    admin = "admin",
    customsOfficer = "customsOfficer",
    shippingLine = "shippingLine",
    portAgent = "portAgent"
}
export enum DocumentStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum DocumentType {
    manifest = "manifest",
    billOfLading = "billOfLading",
    customsDeclaration = "customsDeclaration"
}
export enum ShipmentStatus {
    customsHold = "customsHold",
    inTransit = "inTransit",
    cleared = "cleared",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDocument(docType: DocumentType, title: string, shipmentId: bigint, content: string): Promise<bigint>;
    createShipment(containerNumber: string, origin: string, destination: string, shipper: string, consignee: string, status: ShipmentStatus, vesselName: string, eta: Time): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessagesByRole(role: ActorRole): Promise<Array<Message>>;
    getReports(): Promise<ReportSummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDocuments(): Promise<Array<Document>>;
    listMessages(): Promise<Array<Message>>;
    listShipments(): Promise<Array<Shipment>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(fromRole: ActorRole, toRole: ActorRole, subject: string, content: string): Promise<bigint>;
    updateDocumentStatus(documentId: bigint, newStatus: DocumentStatus): Promise<void>;
    updateShipmentStatus(shipmentId: bigint, newStatus: ShipmentStatus): Promise<void>;
}

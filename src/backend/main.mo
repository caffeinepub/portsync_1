import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Role types for authorization
  public type ActorRole = {
    #admin;
    #portAgent;
    #customsOfficer;
    #shippingLine;
  };

  // Shipment status
  public type ShipmentStatus = {
    #inTransit;
    #customsHold;
    #cleared;
    #delivered;
  };

  // Document types and status
  public type DocumentType = {
    #billOfLading;
    #customsDeclaration;
    #manifest;
  };

  public type DocumentStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // Message structure
  public type Message = {
    id : Nat;
    fromRole : ActorRole;
    toRole : ActorRole;
    subject : Text;
    content : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  // Shipment structure
  public type Shipment = {
    id : Nat;
    containerNumber : Text;
    origin : Text;
    destination : Text;
    shipper : Text;
    consignee : Text;
    status : ShipmentStatus;
    vesselName : Text;
    eta : Time.Time;
    createdAt : Time.Time;
  };

  // Document structure
  public type Document = {
    id : Nat;
    docType : DocumentType;
    title : Text;
    shipmentId : Nat;
    content : Text;
    status : DocumentStatus;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  // User Profile
  public type UserProfile = {
    name : Text;
    role : ActorRole;
  };

  // Report structure
  public type ReportSummary = {
    totalShipmentsByStatus : [(ShipmentStatus, Nat)];
    totalDocumentsByStatus : [(DocumentStatus, Nat)];
    totalMessages : Nat;
  };

  // State storage
  let shipments = Map.empty<Nat, Shipment>();
  let documents = Map.empty<Nat, Document>();
  let messages = Map.empty<Nat, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ID counters
  var shipmentIdCounter = 1;
  var documentIdCounter = 1;
  var messageIdCounter = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to get user's actor role
  func getUserActorRole(caller : Principal) : ?ActorRole {
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile.role };
      case (null) { null };
    };
  };

  // Helper function to check if user has specific actor role
  func hasActorRole(caller : Principal, requiredRole : ActorRole) : Bool {
    // Admins can do everything
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (getUserActorRole(caller)) {
      case (?role) { role == requiredRole };
      case (null) { false };
    };
  };

  module MessageModule {
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  // ===== User Profile Management =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ===== Shipment Management =====

  public shared ({ caller }) func createShipment(
    containerNumber : Text,
    origin : Text,
    destination : Text,
    shipper : Text,
    consignee : Text,
    status : ShipmentStatus,
    vesselName : Text,
    eta : Time.Time
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create shipments");
    };

    // Only Port Agents and Shipping Lines can create shipments
    if (not (hasActorRole(caller, #portAgent) or hasActorRole(caller, #shippingLine))) {
      Runtime.trap("Unauthorized: Only Port Agents or Shipping Lines can create shipments");
    };

    let shipment : Shipment = {
      id = shipmentIdCounter;
      containerNumber;
      origin;
      destination;
      shipper;
      consignee;
      status;
      vesselName;
      eta;
      createdAt = Time.now();
    };
    shipments.add(shipmentIdCounter, shipment);
    shipmentIdCounter += 1;
    shipment.id;
  };

  public shared ({ caller }) func updateShipmentStatus(shipmentId : Nat, newStatus : ShipmentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update shipment status");
    };

    // Port Agents, Customs Officers, and Shipping Lines can update status
    if (not (hasActorRole(caller, #portAgent) or hasActorRole(caller, #customsOfficer) or hasActorRole(caller, #shippingLine))) {
      Runtime.trap("Unauthorized: Only Port Agents, Customs Officers, or Shipping Lines can update shipment status");
    };

    switch (shipments.get(shipmentId)) {
      case (null) { Runtime.trap("Shipment does not exist"); };
      case (?shipment) {
        let updatedShipment = {
          id = shipment.id;
          containerNumber = shipment.containerNumber;
          origin = shipment.origin;
          destination = shipment.destination;
          shipper = shipment.shipper;
          consignee = shipment.consignee;
          status = newStatus;
          vesselName = shipment.vesselName;
          eta = shipment.eta;
          createdAt = shipment.createdAt;
        };
        shipments.add(shipmentId, updatedShipment);
      };
    };
  };

  public query ({ caller }) func listShipments() : async [Shipment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list shipments");
    };

    shipments.values().toArray();
  };

  // ===== Document Management =====

  public shared ({ caller }) func createDocument(
    docType : DocumentType,
    title : Text,
    shipmentId : Nat,
    content : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };

    // Port Agents and Shipping Lines can create documents
    if (not (hasActorRole(caller, #portAgent) or hasActorRole(caller, #shippingLine))) {
      Runtime.trap("Unauthorized: Only Port Agents or Shipping Lines can create documents");
    };

    switch (shipments.get(shipmentId)) {
      case (null) { Runtime.trap("Shipment does not exist"); };
      case (?_) {
        let document : Document = {
          id = documentIdCounter;
          docType;
          title;
          shipmentId;
          content;
          status = #pending;
          createdBy = caller;
          createdAt = Time.now();
        };
        documents.add(documentIdCounter, document);
        documentIdCounter += 1;
        document.id;
      };
    };
  };

  public shared ({ caller }) func updateDocumentStatus(documentId : Nat, newStatus : DocumentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update document status");
    };

    // Only Customs Officers can approve/reject documents
    if (not hasActorRole(caller, #customsOfficer)) {
      Runtime.trap("Unauthorized: Only Customs Officers can update document status");
    };

    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document does not exist"); };
      case (?document) {
        let updatedDocument = {
          id = document.id;
          docType = document.docType;
          title = document.title;
          shipmentId = document.shipmentId;
          content = document.content;
          status = newStatus;
          createdBy = document.createdBy;
          createdAt = document.createdAt;
        };
        documents.add(documentId, updatedDocument);
      };
    };
  };

  public query ({ caller }) func listDocuments() : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list documents");
    };

    documents.values().toArray();
  };

  // ===== Message Management =====

  public shared ({ caller }) func sendMessage(
    fromRole : ActorRole,
    toRole : ActorRole,
    subject : Text,
    content : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    // Verify the caller has the role they claim to send from
    if (not hasActorRole(caller, fromRole)) {
      Runtime.trap("Unauthorized: You cannot send messages from a role you don't have");
    };

    let message : Message = {
      id = messageIdCounter;
      fromRole;
      toRole;
      subject;
      content;
      timestamp = Time.now();
      isRead = false;
    };
    messages.add(messageIdCounter, message);
    messageIdCounter += 1;
    message.id;
  };

  public query ({ caller }) func getMessagesByRole(role : ActorRole) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    // Users can only view messages for their own role
    if (not hasActorRole(caller, role)) {
      Runtime.trap("Unauthorized: You can only view messages for your own role");
    };

    messages.values().toArray().filter(func(m : Message) : Bool { m.toRole == role }).sort(MessageModule.compareByTimestamp);
  };

  public query ({ caller }) func listMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list messages");
    };

    // Users can see messages to/from their role
    switch (getUserActorRole(caller)) {
      case (?userRole) {
        messages.values().toArray().filter(func(m : Message) : Bool {
          m.toRole == userRole or m.fromRole == userRole
        }).sort(MessageModule.compareByTimestamp);
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  // ===== Reports =====

  public query ({ caller }) func getReports() : async ReportSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };

    // Count shipments by status
    var inTransitCount = 0;
    var customsHoldCount = 0;
    var clearedCount = 0;
    var deliveredCount = 0;

    for (shipment in shipments.values()) {
      switch (shipment.status) {
        case (#inTransit) { inTransitCount += 1; };
        case (#customsHold) { customsHoldCount += 1; };
        case (#cleared) { clearedCount += 1; };
        case (#delivered) { deliveredCount += 1; };
      };
    };

    // Count documents by status
    var pendingCount = 0;
    var approvedCount = 0;
    var rejectedCount = 0;

    for (document in documents.values()) {
      switch (document.status) {
        case (#pending) { pendingCount += 1; };
        case (#approved) { approvedCount += 1; };
        case (#rejected) { rejectedCount += 1; };
      };
    };

    {
      totalShipmentsByStatus = [
        (#inTransit, inTransitCount),
        (#customsHold, customsHoldCount),
        (#cleared, clearedCount),
        (#delivered, deliveredCount)
      ];
      totalDocumentsByStatus = [
        (#pending, pendingCount),
        (#approved, approvedCount),
        (#rejected, rejectedCount)
      ];
      totalMessages = messages.size();
    };
  };
};

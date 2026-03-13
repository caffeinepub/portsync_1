import {
  ActorRole,
  DocumentType,
  ShipmentStatus,
  type backendInterface,
} from "../backend.d";

const SEED_KEY = "portsync_seeded_v1";

export async function seedInitialData(actor: backendInterface): Promise<void> {
  if (localStorage.getItem(SEED_KEY)) return;

  try {
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const day = BigInt(24 * 60 * 60) * BigInt(1_000_000_000);

    const [s1, s2, s3, _s4, s5] = await Promise.all([
      actor.createShipment(
        "MSCU7234891",
        "Shanghai, China",
        "Rotterdam, Netherlands",
        "Pacific Trade Corp",
        "Euro Import GmbH",
        ShipmentStatus.inTransit,
        "MSC Paloma",
        now + day * BigInt(4),
      ),
      actor.createShipment(
        "COSCO5518302",
        "Singapore",
        "Los Angeles, USA",
        "Asia Pacific Logistics",
        "West Coast Distributors",
        ShipmentStatus.customsHold,
        "COSCO Harmony",
        now + day * BigInt(2),
      ),
      actor.createShipment(
        "EVER4409271",
        "Hamburg, Germany",
        "Dubai, UAE",
        "European Export House",
        "Gulf Trading FZE",
        ShipmentStatus.cleared,
        "Ever Apex",
        now - day * BigInt(1),
      ),
      actor.createShipment(
        "YANG8831056",
        "Busan, South Korea",
        "Sydney, Australia",
        "Hanseatic Freight",
        "Oceania Imports",
        ShipmentStatus.delivered,
        "Yang Ming Warranty",
        now - day * BigInt(5),
      ),
      actor.createShipment(
        "MAEU3310987",
        "Felixstowe, UK",
        "Antwerp, Belgium",
        "British Maritime Ltd",
        "Benelux Cargo NV",
        ShipmentStatus.inTransit,
        "Maersk Elgin",
        now + day * BigInt(6),
      ),
    ]);

    await Promise.all([
      actor.createDocument(
        DocumentType.billOfLading,
        "B/L for MSCU7234891 – MSC Paloma",
        s1,
        "Bill of Lading for 3x40ft containers of automotive parts. Shipper: Pacific Trade Corp. Port of loading: Shanghai. Vessel: MSC Paloma. Voyage: 2024-W48.",
      ),
      actor.createDocument(
        DocumentType.customsDeclaration,
        "Customs Declaration – COSCO5518302",
        s2,
        "Customs entry for 2x20ft containers of consumer electronics. HS Code: 8471. Declared value: USD 485,000. Importer: West Coast Distributors.",
      ),
      actor.createDocument(
        DocumentType.manifest,
        "Cargo Manifest – Ever Apex",
        s3,
        "Consolidated cargo manifest for Ever Apex voyage HAM-DXB-2024-47. Total TEU: 12,450. Hazardous cargo: nil. Reefer units: 34.",
      ),
      actor.createDocument(
        DocumentType.billOfLading,
        "B/L for Maersk Elgin – MAEU3310987",
        s5,
        "Bill of Lading for 1x40ft HC container of machinery components. Shipper: British Maritime Ltd. Loading port: Felixstowe.",
      ),
    ]);

    await Promise.all([
      actor.sendMessage(
        ActorRole.portAgent,
        ActorRole.customsOfficer,
        "Urgent: COSCO5518302 Customs Hold Review",
        "Please review the customs hold on container COSCO5518302. Documentation has been updated and shipper has provided additional certificates of origin. Requesting expedited clearance.",
      ),
      actor.sendMessage(
        ActorRole.customsOfficer,
        ActorRole.shippingLine,
        "Physical Inspection Required – MAEU3310987",
        "Container MAEU3310987 has been flagged for physical inspection upon arrival. Please ensure container is accessible and schedule with our inspection team. Reference: CI-2024-4471.",
      ),
      actor.sendMessage(
        ActorRole.admin,
        ActorRole.portAgent,
        "System Maintenance Window – Sunday 02:00–04:00 UTC",
        "The PortSync system will undergo scheduled maintenance this Sunday from 02:00 to 04:00 UTC. All vessel movements and document submissions should be completed before this window.",
      ),
    ]);

    localStorage.setItem(SEED_KEY, "1");
  } catch (err) {
    console.warn("Seed data failed (may already exist):", err);
    localStorage.setItem(SEED_KEY, "1");
  }
}

import { listingStatuses } from "../../../../packages/contracts/src/index.mjs";

export const users = [
  {
    id: "seller_1",
    email: "maya@example.com",
    fullName: "Maya Chen",
    verificationStatus: "verified"
  },
  {
    id: "buyer_1",
    email: "ravi@example.com",
    fullName: "Ravi Patel",
    verificationStatus: "verified"
  },
  {
    id: "buyer_2",
    email: "nora@example.com",
    fullName: "Nora Lee",
    verificationStatus: "pending"
  }
];

export const listings = [
  {
    id: "listing_1",
    sellerId: "seller_1",
    status: listingStatuses.published,
    city: "San Francisco",
    neighborhood: "Mission District",
    streetAddress: "123 Valencia St",
    monthlyRentCents: 285000,
    leaseEndDate: "2027-02-28",
    availableMoveInDate: "2026-06-01",
    bedroomCount: 1,
    description: "Sunny one bedroom near transit with eight months left on the lease.",
    amenities: ["in-unit laundry", "bike storage", "pet friendly"],
    photoIds: ["photo_1", "photo_2", "photo_3"],
    createdAt: "2026-05-01T12:00:00.000Z"
  },
  {
    id: "listing_2",
    sellerId: "seller_1",
    status: listingStatuses.published,
    city: "San Francisco",
    neighborhood: "SoMa",
    streetAddress: "88 Howard St",
    monthlyRentCents: 320000,
    leaseEndDate: "2026-12-31",
    availableMoveInDate: "2026-05-20",
    bedroomCount: 1,
    description: "Furnished loft with six months remaining and a fast landlord approval path.",
    amenities: ["furnished", "doorman", "roof deck"],
    photoIds: ["photo_4", "photo_5", "photo_6"],
    createdAt: "2026-05-02T12:00:00.000Z"
  },
  {
    id: "listing_3",
    sellerId: "seller_1",
    status: listingStatuses.published,
    city: "Oakland",
    neighborhood: "Temescal",
    streetAddress: "411 49th St",
    monthlyRentCents: 245000,
    leaseEndDate: "2027-04-30",
    availableMoveInDate: "2026-07-15",
    bedroomCount: 0,
    description: "Quiet studio with parking and nine months remaining.",
    amenities: ["parking", "courtyard", "storage"],
    photoIds: ["photo_7", "photo_8", "photo_9"],
    createdAt: "2026-05-03T12:00:00.000Z"
  }
];

export const acceptedOfferAccess = [
  {
    listingId: "listing_1",
    buyerId: "buyer_1"
  }
];


import assert from "node:assert/strict";
import test from "node:test";

import { canPublishListing, listingStatuses, publicListingView, validateListingDraft } from "../src/listings.mjs";

const validListing = {
  id: "listing_1",
  sellerId: "seller_1",
  status: listingStatuses.draft,
  city: "San Francisco",
  neighborhood: "Mission District",
  streetAddress: "123 Valencia St",
  monthlyRentCents: 285000,
  leaseEndDate: "2027-02-28",
  availableMoveInDate: "2026-06-01",
  bedroomCount: 1,
  description: "Sunny one bedroom near transit.",
  photoIds: ["photo_1", "photo_2", "photo_3"]
};

test("validates listing draft requirements", () => {
  assert.deepEqual(validateListingDraft(validListing), []);
  assert.match(validateListingDraft({ ...validListing, photoIds: [] }).join(","), /at least 3 photos/);
});

test("requires verified seller before publish", () => {
  assert.equal(
    canPublishListing({
      listing: validListing,
      seller: { id: "seller_1", verificationStatus: "pending" }
    }),
    false
  );
  assert.equal(
    canPublishListing({
      listing: validListing,
      seller: { id: "seller_1", verificationStatus: "verified" }
    }),
    true
  );
});

test("gates exact street address until accepted offer", () => {
  assert.equal(publicListingView({ listing: validListing }).streetAddress, null);
  assert.equal(publicListingView({ listing: validListing, viewerHasAcceptedOffer: true }).streetAddress, "123 Valencia St");
});


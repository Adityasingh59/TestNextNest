import assert from "node:assert/strict";
import test from "node:test";

import { acceptOffer, canAcceptOffer, offerStatuses, validateOfferInput } from "../src/offers.mjs";

const offer = {
  id: "offer_1",
  buyerId: "buyer_1",
  listingId: "listing_1",
  conversationId: "conversation_1",
  status: offerStatuses.sent,
  proposedMoveInDate: "2026-06-01",
  offeredRentCents: 285000,
  durationMonths: 8
};

test("validates structured offer primitives", () => {
  assert.deepEqual(validateOfferInput(offer), []);
  assert.match(validateOfferInput({ ...offer, durationMonths: 0 }).join(","), /durationMonths/);
});

test("requires buyer verification before offer acceptance", () => {
  assert.equal(canAcceptOffer({ offer, buyer: { verificationStatus: "pending" } }), false);
  assert.equal(canAcceptOffer({ offer, buyer: { verificationStatus: "verified" } }), true);
});

test("prevents multiple accepted offers in the same conversation", () => {
  assert.equal(
    canAcceptOffer({
      offer,
      buyer: { verificationStatus: "verified" },
      activeAcceptedOfferForConversation: { id: "offer_0" }
    }),
    false
  );
});

test("accepts a valid offer with an audit-friendly timestamp", () => {
  const accepted = acceptOffer({
    offer,
    buyer: { verificationStatus: "verified" },
    actorUserId: "seller_1",
    now: new Date("2026-05-01T12:00:00.000Z")
  });

  assert.equal(accepted.status, offerStatuses.accepted);
  assert.equal(accepted.acceptedByUserId, "seller_1");
  assert.equal(accepted.acceptedAt, "2026-05-01T12:00:00.000Z");
});


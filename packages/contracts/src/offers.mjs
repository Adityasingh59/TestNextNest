export const offerStatuses = Object.freeze({
  sent: "sent",
  accepted: "accepted",
  rejected: "rejected",
  countered: "countered",
  expired: "expired"
});

export function validateOfferInput(offer) {
  const errors = [];

  if (!offer.buyerId) errors.push("buyerId is required");
  if (!offer.listingId) errors.push("listingId is required");
  if (!offer.conversationId) errors.push("conversationId is required");
  if (!offer.proposedMoveInDate) errors.push("proposedMoveInDate is required");
  if (!Number.isInteger(offer.offeredRentCents) || offer.offeredRentCents <= 0) {
    errors.push("offeredRentCents must be a positive integer");
  }
  if (!Number.isInteger(offer.durationMonths) || offer.durationMonths <= 0) {
    errors.push("durationMonths must be a positive integer");
  }

  return errors;
}

export function canAcceptOffer({ offer, buyer, activeAcceptedOfferForConversation = null }) {
  if (offer.status !== offerStatuses.sent) return false;
  if (buyer.verificationStatus !== "verified") return false;
  if (activeAcceptedOfferForConversation) return false;
  return validateOfferInput(offer).length === 0;
}

export function acceptOffer({ offer, buyer, actorUserId, activeAcceptedOfferForConversation = null, now = new Date() }) {
  if (!actorUserId) throw new Error("An actor user id is required.");
  if (!canAcceptOffer({ offer, buyer, activeAcceptedOfferForConversation })) {
    throw new Error("Offer cannot be accepted.");
  }

  const acceptedAt = now.toISOString();

  return {
    ...offer,
    status: offerStatuses.accepted,
    acceptedAt,
    acceptedByUserId: actorUserId,
    updatedAt: acceptedAt
  };
}


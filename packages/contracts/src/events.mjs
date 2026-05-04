export const eventTypes = Object.freeze({
  userVerified: "user.verified",
  listingCreated: "listing.created",
  listingPublished: "listing.published",
  listingUnpublished: "listing.unpublished",
  listingCancelled: "listing.cancelled",
  conversationCreated: "conversation.created",
  messageSent: "message.sent",
  messageRead: "message.read",
  offerCreated: "offer.created",
  offerCountered: "offer.countered",
  offerAccepted: "offer.accepted",
  offerRejected: "offer.rejected",
  dealCreated: "deal.created",
  dealStateChanged: "deal.state_changed",
  dealCancelled: "deal.cancelled",
  dealBlocked: "deal.blocked",
  documentUploaded: "document.uploaded",
  documentViewed: "document.viewed",
  landlordApprovalRequested: "landlord_approval.requested",
  landlordApprovalApproved: "landlord_approval.approved",
  landlordApprovalRejected: "landlord_approval.rejected",
  paymentMarkedPaid: "payment.marked_paid",
  notificationCreated: "notification.created"
});

export function createDomainEvent({
  id,
  type,
  actorUserId,
  subjectType,
  subjectId,
  correlationId,
  payload = {},
  occurredAt = new Date()
}) {
  if (!id) throw new Error("Event id is required.");
  if (!Object.values(eventTypes).includes(type)) throw new Error(`Unsupported event type: ${type}`);
  if (!actorUserId) throw new Error("Event actor user id is required.");
  if (!subjectType) throw new Error("Event subject type is required.");
  if (!subjectId) throw new Error("Event subject id is required.");

  return {
    id,
    type,
    occurredAt: occurredAt.toISOString(),
    actorUserId,
    subjectType,
    subjectId,
    correlationId: correlationId ?? subjectId,
    payload
  };
}


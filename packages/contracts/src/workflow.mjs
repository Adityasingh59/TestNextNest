export const dealStates = Object.freeze({
  offerAccepted: "offer_accepted",
  documentsPending: "documents_pending",
  landlordApproval: "landlord_approval",
  payment: "payment",
  transferComplete: "transfer_complete",
  cancelled: "cancelled",
  blocked: "blocked"
});

export const terminalDealStates = new Set([
  dealStates.transferComplete,
  dealStates.cancelled,
  dealStates.blocked
]);

export const dealEvents = Object.freeze({
  dealCreated: "deal.created",
  stateChanged: "deal.state_changed",
  cancelled: "deal.cancelled",
  blocked: "deal.blocked"
});

const forwardTransitions = new Map([
  [dealStates.offerAccepted, new Set([dealStates.documentsPending, dealStates.cancelled])],
  [dealStates.documentsPending, new Set([dealStates.landlordApproval, dealStates.cancelled])],
  [dealStates.landlordApproval, new Set([dealStates.payment, dealStates.blocked, dealStates.cancelled])],
  [dealStates.payment, new Set([dealStates.transferComplete, dealStates.cancelled])]
]);

export function canTransitionDeal({ from, to, context = {} }) {
  if (!Object.values(dealStates).includes(from)) return false;
  if (!Object.values(dealStates).includes(to)) return false;
  if (terminalDealStates.has(from)) return false;
  if (!forwardTransitions.get(from)?.has(to)) return false;

  if (to === dealStates.landlordApproval) {
    return Boolean(context.sellerLeaseUploaded && context.buyerDocumentsUploaded);
  }

  if (to === dealStates.payment) {
    return Boolean(context.landlordApproved);
  }

  if (to === dealStates.transferComplete) {
    return Boolean(context.paymentRecorded);
  }

  if (to === dealStates.cancelled || to === dealStates.blocked) {
    return typeof context.reason === "string" && context.reason.trim().length > 0;
  }

  return true;
}

export function transitionDeal({ deal, to, actorUserId, trigger, context = {}, now = new Date() }) {
  if (!deal?.id) throw new Error("A deal id is required.");
  if (!actorUserId) throw new Error("An actor user id is required.");
  if (!trigger) throw new Error("A transition trigger is required.");

  const from = deal.state;
  if (!canTransitionDeal({ from, to, context })) {
    throw new Error(`Invalid deal transition from ${from} to ${to}.`);
  }

  const occurredAt = now.toISOString();
  const nextDeal = {
    ...deal,
    state: to,
    updatedAt: occurredAt
  };

  const auditRecord = {
    dealId: deal.id,
    actorUserId,
    trigger,
    previousState: from,
    nextState: to,
    reason: context.reason ?? null,
    occurredAt
  };

  const event = {
    id: `${deal.id}:${from}:${to}:${occurredAt}`,
    type: to === dealStates.cancelled ? dealEvents.cancelled : to === dealStates.blocked ? dealEvents.blocked : dealEvents.stateChanged,
    occurredAt,
    actorUserId,
    subjectType: "deal",
    subjectId: deal.id,
    correlationId: context.correlationId ?? deal.id,
    payload: {
      previousState: from,
      nextState: to,
      reason: context.reason ?? null
    }
  };

  return { deal: nextDeal, auditRecord, event };
}

export function getDealActionItems(deal) {
  switch (deal.state) {
    case dealStates.offerAccepted:
      return {
        buyer: "Review accepted offer",
        seller: "Confirm document requirements"
      };
    case dealStates.documentsPending:
      return {
        buyer: "Upload required documents",
        seller: "Upload lease agreement"
      };
    case dealStates.landlordApproval:
      return {
        buyer: "Wait for landlord response",
        seller: "Send landlord approval request"
      };
    case dealStates.payment:
      return {
        buyer: "Complete transfer payment",
        seller: "Confirm payment status"
      };
    case dealStates.transferComplete:
      return {
        buyer: "Download transfer record",
        seller: "Download transfer record"
      };
    case dealStates.cancelled:
      return {
        buyer: "Review cancellation reason",
        seller: "Review cancellation reason"
      };
    case dealStates.blocked:
      return {
        buyer: "Review blocker",
        seller: "Resolve blocker or relist"
      };
    default:
      throw new Error(`Unsupported deal state: ${deal.state}`);
  }
}


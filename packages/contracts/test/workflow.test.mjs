import assert from "node:assert/strict";
import test from "node:test";

import { canTransitionDeal, dealEvents, dealStates, getDealActionItems, transitionDeal } from "../src/workflow.mjs";

test("allows the happy-path deal workflow when preconditions are met", () => {
  const base = { id: "deal_1", state: dealStates.offerAccepted, updatedAt: "2026-05-01T00:00:00.000Z" };

  assert.equal(canTransitionDeal({ from: dealStates.offerAccepted, to: dealStates.documentsPending }), true);
  assert.equal(
    canTransitionDeal({
      from: dealStates.documentsPending,
      to: dealStates.landlordApproval,
      context: { sellerLeaseUploaded: true, buyerDocumentsUploaded: true }
    }),
    true
  );
  assert.equal(
    canTransitionDeal({
      from: dealStates.landlordApproval,
      to: dealStates.payment,
      context: { landlordApproved: true }
    }),
    true
  );
  assert.equal(
    canTransitionDeal({
      from: dealStates.payment,
      to: dealStates.transferComplete,
      context: { paymentRecorded: true }
    }),
    true
  );

  const result = transitionDeal({
    deal: base,
    to: dealStates.documentsPending,
    actorUserId: "user_seller",
    trigger: "offer.accepted",
    now: new Date("2026-05-01T12:00:00.000Z")
  });

  assert.equal(result.deal.state, dealStates.documentsPending);
  assert.equal(result.auditRecord.previousState, dealStates.offerAccepted);
  assert.equal(result.event.type, dealEvents.stateChanged);
});

test("blocks landlord approval until both sides have uploaded required documents", () => {
  assert.equal(
    canTransitionDeal({
      from: dealStates.documentsPending,
      to: dealStates.landlordApproval,
      context: { sellerLeaseUploaded: true, buyerDocumentsUploaded: false }
    }),
    false
  );
});

test("requires a reason for cancelled and blocked terminal states", () => {
  assert.equal(canTransitionDeal({ from: dealStates.payment, to: dealStates.cancelled }), false);
  assert.equal(
    canTransitionDeal({
      from: dealStates.landlordApproval,
      to: dealStates.blocked,
      context: { reason: "Landlord rejected buyer profile" }
    }),
    true
  );
});

test("prevents transitions out of terminal states", () => {
  assert.equal(
    canTransitionDeal({
      from: dealStates.cancelled,
      to: dealStates.documentsPending,
      context: { reason: "Restart" }
    }),
    false
  );
});

test("returns one action item per party for workflow states", () => {
  const actionItems = getDealActionItems({ state: dealStates.documentsPending });

  assert.equal(Object.keys(actionItems).length, 2);
  assert.match(actionItems.buyer, /Upload/);
  assert.match(actionItems.seller, /lease/i);
});


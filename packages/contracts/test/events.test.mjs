import assert from "node:assert/strict";
import test from "node:test";

import { createDomainEvent, eventTypes } from "../src/events.mjs";

test("creates a normalized domain event envelope", () => {
  const event = createDomainEvent({
    id: "event_1",
    type: eventTypes.listingPublished,
    actorUserId: "seller_1",
    subjectType: "listing",
    subjectId: "listing_1",
    payload: { status: "published" },
    occurredAt: new Date("2026-05-01T12:00:00.000Z")
  });

  assert.equal(event.type, eventTypes.listingPublished);
  assert.equal(event.correlationId, "listing_1");
  assert.equal(event.occurredAt, "2026-05-01T12:00:00.000Z");
});

test("rejects unsupported event types", () => {
  assert.throws(
    () =>
      createDomainEvent({
        id: "event_1",
        type: "unknown.event",
        actorUserId: "user_1",
        subjectType: "listing",
        subjectId: "listing_1"
      }),
    /Unsupported event type/
  );
});


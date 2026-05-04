import assert from "node:assert/strict";
import test from "node:test";

import { getListingDetail, searchListings } from "../src/listings.mjs";

test("searches published listings by city and price", () => {
  const params = new URLSearchParams({
    city: "San Francisco",
    maxRent: "300000"
  });
  const results = searchListings(params);

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "listing_1");
  assert.equal(results[0].streetAddress, null);
});

test("sorts listings by price ascending", () => {
  const params = new URLSearchParams({
    sort: "price_asc"
  });
  const results = searchListings(params);

  assert.equal(results[0].monthlyRentCents, 245000);
});

test("gates listing detail street address until accepted offer access", () => {
  assert.equal(getListingDetail({ listingId: "listing_1" }).streetAddress, null);
  assert.equal(getListingDetail({ listingId: "listing_1", viewerUserId: "buyer_1" }).streetAddress, "123 Valencia St");
});


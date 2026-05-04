export const listingStatuses = Object.freeze({
  draft: "draft",
  published: "published",
  paused: "paused",
  cancelled: "cancelled",
  transferred: "transferred"
});

const requiredListingFields = [
  "sellerId",
  "city",
  "neighborhood",
  "streetAddress",
  "monthlyRentCents",
  "leaseEndDate",
  "availableMoveInDate",
  "bedroomCount",
  "description"
];

export function validateListingDraft(listing) {
  const errors = [];

  for (const field of requiredListingFields) {
    if (listing[field] === undefined || listing[field] === null || listing[field] === "") {
      errors.push(`${field} is required`);
    }
  }

  if (!Number.isInteger(listing.monthlyRentCents) || listing.monthlyRentCents <= 0) {
    errors.push("monthlyRentCents must be a positive integer");
  }

  if (!Number.isInteger(listing.bedroomCount) || listing.bedroomCount < 0) {
    errors.push("bedroomCount must be a non-negative integer");
  }

  if (!Array.isArray(listing.photoIds) || listing.photoIds.length < 3) {
    errors.push("at least 3 photos are required");
  }

  return errors;
}

export function canPublishListing({ listing, seller }) {
  if (listing.status !== listingStatuses.draft && listing.status !== listingStatuses.paused) {
    return false;
  }

  if (seller.verificationStatus !== "verified") {
    return false;
  }

  return validateListingDraft(listing).length === 0;
}

export function publicListingView({ listing, viewerHasAcceptedOffer = false }) {
  const { streetAddress, ...publicFields } = listing;

  return {
    ...publicFields,
    streetAddress: viewerHasAcceptedOffer ? streetAddress : null,
    addressVisibility: viewerHasAcceptedOffer ? "exact" : "gated"
  };
}


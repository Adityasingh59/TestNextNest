import { listingStatuses, publicListingView } from "../../../packages/contracts/src/index.mjs";
import { acceptedOfferAccess, listings } from "./data/seed.mjs";

export function searchListings(params) {
  const city = params.get("city")?.trim().toLowerCase();
  const minRent = numberParam(params, "minRent");
  const maxRent = numberParam(params, "maxRent");
  const bedrooms = numberParam(params, "bedrooms");
  const moveInBy = params.get("moveInBy");
  const sort = params.get("sort") ?? "recent";

  const filtered = listings
    .filter((listing) => listing.status === listingStatuses.published)
    .filter((listing) => !city || listing.city.toLowerCase() === city)
    .filter((listing) => minRent === null || listing.monthlyRentCents >= minRent)
    .filter((listing) => maxRent === null || listing.monthlyRentCents <= maxRent)
    .filter((listing) => bedrooms === null || listing.bedroomCount === bedrooms)
    .filter((listing) => !moveInBy || listing.availableMoveInDate <= moveInBy);

  const sorted = filtered.toSorted((left, right) => {
    if (sort === "price_asc") return left.monthlyRentCents - right.monthlyRentCents;
    if (sort === "price_desc") return right.monthlyRentCents - left.monthlyRentCents;
    return right.createdAt.localeCompare(left.createdAt);
  });

  return sorted.map((listing) => publicListingView({ listing }));
}

export function getListingDetail({ listingId, viewerUserId = null }) {
  const listing = listings.find((item) => item.id === listingId && item.status === listingStatuses.published);
  if (!listing) return null;

  return publicListingView({
    listing,
    viewerHasAcceptedOffer: acceptedOfferAccess.some(
      (access) => access.listingId === listingId && access.buyerId === viewerUserId
    )
  });
}

function numberParam(params, key) {
  const value = params.get(key);
  if (value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}


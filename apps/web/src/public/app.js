const apiBaseUrl = "http://127.0.0.1:4000";
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const form = document.querySelector("#listing-filters");
const results = document.querySelector("#listing-results");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  loadListings(new FormData(form));
});

await loadListings(new FormData(form));

async function loadListings(formData) {
  const params = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    if (value) params.set(key, value);
  }

  results.innerHTML = renderLoading();

  try {
    const response = await fetch(`${apiBaseUrl}/listings?${params}`);
    if (!response.ok) throw new Error("Listing search failed");
    const payload = await response.json();
    results.innerHTML = payload.listings.length > 0 ? payload.listings.map(renderListing).join("") : renderEmpty();
  } catch {
    results.innerHTML = renderError();
  }
}

function renderListing(listing) {
  const rent = formatter.format(listing.monthlyRentCents / 100);
  const bedrooms = listing.bedroomCount === 0 ? "Studio" : `${listing.bedroomCount} bed`;
  const address = listing.addressVisibility === "exact" ? listing.streetAddress : "Exact address gated";

  return `
    <article class="listing">
      <span>${rent}/mo</span>
      <h3>${bedrooms} in ${listing.neighborhood}</h3>
      <p>${listing.description}</p>
      <dl>
        <div><dt>Move-in</dt><dd>${listing.availableMoveInDate}</dd></div>
        <div><dt>Lease ends</dt><dd>${listing.leaseEndDate}</dd></div>
        <div><dt>Address</dt><dd>${address}</dd></div>
      </dl>
    </article>
  `;
}

function renderLoading() {
  return `
    <article class="listing">
      <span>Loading</span>
      <h3>Fetching listings</h3>
      <p>NextNest is loading available lease takeovers.</p>
    </article>
  `;
}

function renderEmpty() {
  return `
    <article class="listing">
      <span>No matches</span>
      <h3>Try another filter</h3>
      <p>No published lease takeovers match the current search.</p>
    </article>
  `;
}

function renderError() {
  return `
    <article class="listing">
      <span>Offline</span>
      <h3>Listings unavailable</h3>
      <p>Start the API on port 4000, then refresh this page.</p>
    </article>
  `;
}

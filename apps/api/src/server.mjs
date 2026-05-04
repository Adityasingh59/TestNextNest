import http from "node:http";

import { dealStates, getDealActionItems } from "../../../packages/contracts/src/index.mjs";
import { sendError, sendJson } from "./http.mjs";
import { getListingDetail, searchListings } from "./listings.mjs";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "127.0.0.1";

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/health") {
    sendJson(response, 200, { status: "ok", service: "nextnest-api" });
    return;
  }

  if (url.pathname === "/listings") {
    sendJson(response, 200, { listings: searchListings(url.searchParams) });
    return;
  }

  const listingMatch = url.pathname.match(/^\/listings\/([^/]+)$/);
  if (listingMatch) {
    const listing = getListingDetail({
      listingId: listingMatch[1],
      viewerUserId: url.searchParams.get("viewerUserId")
    });
    if (!listing) {
      sendError(response, 404, "Listing not found");
      return;
    }
    sendJson(response, 200, { listing });
    return;
  }

  if (url.pathname === "/workflow/deal-states") {
    sendJson(response, 200, {
      states: Object.values(dealStates),
      actionItems: Object.fromEntries(
        Object.values(dealStates).map((state) => [state, getDealActionItems({ state })])
      )
    });
    return;
  }

  sendError(response, 404, "Not found");
});

server.listen(port, host, () => {
  console.log(`NextNest API listening on http://${host}:${port}`);
});

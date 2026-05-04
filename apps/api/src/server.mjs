import http from "node:http";

import { dealStates, getDealActionItems } from "../../../packages/contracts/src/index.mjs";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "127.0.0.1";

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/health") {
    sendJson(response, 200, { status: "ok", service: "nextnest-api" });
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

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, host, () => {
  console.log(`NextNest API listening on http://${host}:${port}`);
});

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

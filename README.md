# NextNest

NextNest is a lease-takeover execution platform. The product combines listing discovery, buyer/seller conversations, structured offers, a transaction workflow, document verification, landlord approval, and notifications.

This repository is being built incrementally from `BUILD_PLAN.md`.

## Current Workspace

- `apps/api`: HTTP API foundation
- `apps/web`: responsive web foundation
- `packages/db`: initial PostgreSQL schema and migration checks
- `packages/contracts`: shared product contracts and domain rules
- `docs`: engineering notes and module specs

## Commands

```bash
npm test
npm run lint
npm run validate:db
npm run dev:api
npm run dev:web
```

## API Smoke Routes

- `GET /health`
- `GET /listings?city=San%20Francisco&maxRent=300000`
- `GET /listings/listing_1`
- `GET /listings/listing_1?viewerUserId=buyer_1`
- `GET /workflow/deal-states`

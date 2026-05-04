# Phase 1 Foundation Notes

This first slice establishes the repository shape and the core deal workflow contract.

## Product Decisions Represented

- The accepted-offer workflow follows the PRD state machine.
- State transitions are explicit and guard preconditions.
- Every successful transition returns an audit record and domain event payload.
- Action items return one buyer action and one seller action for every deal state.

## Current Limitations

- API and web apps are intentionally dependency-light foundations.
- Database schema is planned but not implemented in this slice.
- Authentication, persistence, WebSockets, document storage, and notifications come next.

## Next Engineering Slice

- Add `packages/db` with initial schema documentation and migrations.
- Add auth/session skeleton.
- Persist events through an outbox table.
- Expand API endpoints around listings and deals.

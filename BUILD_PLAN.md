# NextNest Build Plan

Source PRD: `NextNest_PRD_v1.md`

## 1. Build Strategy

NextNest should be built as a modular monorepo with service boundaries that match the PRD, while keeping local development and early iteration practical.

Recommended v1 shape:

- `apps/web`: responsive web app for buyers, sellers, and landlords
- `apps/api`: HTTP API and WebSocket gateway
- `packages/db`: database schema, migrations, seed data, typed database client
- `packages/contracts`: shared API DTOs, event types, validation schemas
- `packages/ui`: shared UI primitives once the first screens stabilize
- `infra`: Docker Compose, local Postgres, Redis, object storage, email sandbox
- `docs`: module specs, API contracts, state machines, launch checklists

The PRD asks for independently deployable services. For v1, implement these as strongly separated modules inside one deployable API first, with event-driven contracts and clear ownership. Split into independently deployable services after the core deal flow is proven or when team size requires it.

## 2. Recommended Stack

- Frontend: Next.js, TypeScript, React, server-rendered listing pages, responsive web UI
- Backend: NestJS or equivalent structured Node API, TypeScript, REST plus WebSockets
- Database: PostgreSQL
- ORM: Prisma or Drizzle, with explicit migrations
- Event bus: Redis Streams for v1, wrapped behind an internal event publisher interface
- Realtime: WebSocket gateway backed by Redis
- Object storage: S3-compatible storage in production, MinIO for local development
- Email: provider adapter in production, Mailhog or equivalent locally
- Auth: secure HTTP-only session cookies, email/password, Google OAuth
- Identity verification: adapter interface for Stripe Identity or Persona
- Payments: Stripe Checkout/payment-link style integration when monetization is finalized
- Analytics: event instrumentation layer that can forward to Amplitude or Mixpanel

## 3. Product Modules

### Discovery

Responsibilities:

- Seller listing CRUD
- Draft and published listing states
- Search, filters, pagination, sorting
- Listing detail pages
- Address privacy gating
- Saved searches and alerts later

P0 build scope:

- Listing creation with city, neighborhood, gated address, rent, lease dates, move-in date, bedroom count, photos, amenities, description
- Seller verification requirement before publish
- Search by city, price range, move-in date range, lease duration, bedrooms
- Public listing detail page with verification signals and sign-up gates on CTAs

### Deal

Responsibilities:

- Listing-scoped conversations
- Persistent messages
- WebSocket delivery
- Structured offers
- Offer lifecycle and audit records
- Offer-to-deal transition

P0 build scope:

- One conversation per buyer and listing
- Text chat with read receipts
- Structured offer cards with move-in date, offered rent, and duration
- Offer states: `sent`, `accepted`, `rejected`, `countered`, `expired`
- Accepted offer automatically creates a deal

### Workflow

Responsibilities:

- Deal state machine
- Action items per party
- State transition guards
- Timeline and audit trail
- Cancellation and blocked flows

P0 build scope:

- Deal states: `offer_accepted`, `documents_pending`, `landlord_approval`, `payment`, `transfer_complete`, `cancelled`, `blocked`
- Transition preconditions
- Exactly one primary action per party per state
- Shared dashboard visible to buyer and seller
- Audit log with timestamp, actor, trigger, previous state, next state

### Documents And Verification

Responsibilities:

- User identity verification status
- Lease PDF upload
- Buyer document upload
- Document access control
- Landlord approval magic link
- Document read audit logs

P0 build scope:

- Verification provider adapter
- Seller must be verified before publish
- Buyer must be verified before accepted offer can complete deal flow
- Lease document upload with scoped access
- Buyer required documents configurable per listing
- Landlord approval token, single-use link, 14-day expiry, approve/reject with reason

### Notifications

Responsibilities:

- Event-driven notification routing
- In-app notification center
- Email notifications
- Web push later
- User preferences

P0 build scope:

- Notification events for messages, offers, deal transitions, document requests, landlord responses
- In-app notification center with unread state
- Email delivery adapter
- Preferences by event category and channel

## 4. Core Data Model

Initial tables:

- `users`: account identity, email, name, role hints, verification status
- `sessions`: secure server sessions
- `oauth_accounts`: Google OAuth linkage
- `profiles`: buyer/seller profile fields and trust signals
- `listings`: listing fields, status, location, price, lease dates, visibility controls
- `listing_photos`: ordered photo metadata and object keys
- `listing_amenities`: normalized amenity values
- `saved_searches`: buyer saved filters
- `conversations`: one per buyer/listing pair
- `messages`: persisted chat messages
- `message_reads`: read receipt state
- `offers`: structured offer records and lifecycle status
- `deals`: accepted offer workflow record
- `deal_state_transitions`: audit log for every state transition
- `deal_action_items`: current required actions per party
- `documents`: uploaded file metadata, owner, category, object key, access policy
- `document_reads`: audit log for document access
- `landlord_approval_requests`: tokenized approval links and response state
- `notifications`: in-app notification records
- `notification_preferences`: per-user channel/category preferences
- `events`: durable event outbox for reliable async processing
- `reports`: reported listings/users/messages for moderation

## 5. Event Taxonomy

P0 events:

- `user.verified`
- `listing.created`
- `listing.published`
- `listing.unpublished`
- `listing.cancelled`
- `conversation.created`
- `message.sent`
- `message.read`
- `offer.created`
- `offer.countered`
- `offer.accepted`
- `offer.rejected`
- `deal.created`
- `deal.state_changed`
- `deal.cancelled`
- `deal.blocked`
- `document.uploaded`
- `document.viewed`
- `landlord_approval.requested`
- `landlord_approval.approved`
- `landlord_approval.rejected`
- `payment.marked_paid`
- `notification.created`

Each event should include:

- `id`
- `type`
- `occurred_at`
- `actor_user_id`
- `subject_type`
- `subject_id`
- `correlation_id`
- `payload`

## 6. Deal State Machine

States:

- `offer_accepted`
- `documents_pending`
- `landlord_approval`
- `payment`
- `transfer_complete`
- `cancelled`
- `blocked`

Transition rules:

- `offer_accepted` to `documents_pending`: deal created from accepted offer
- `documents_pending` to `landlord_approval`: seller lease and buyer required documents uploaded
- `landlord_approval` to `payment`: landlord approved through valid token
- `landlord_approval` to `blocked`: landlord rejected with reason
- `payment` to `transfer_complete`: payment recorded or payment-link confirmation received
- any non-terminal state to `cancelled`: buyer or seller cancels with reason

Guardrails:

- Only one accepted offer can exist per conversation
- Only one active deal can progress past `offer_accepted` for a listing
- Exact street address remains hidden until `offer_accepted`
- Documents are readable only by owner, deal participants, and tokenized landlord approval flow where applicable
- Every transition writes an audit record and emits `deal.state_changed`

## 7. Screens To Build

P0 web screens:

- Auth: sign in, sign up, Google OAuth callback, forgot password
- Onboarding: buyer/seller branch, profile basics, verification prompt
- Seller dashboard: listing status, deal status, messages, action items
- Listing create/edit: multi-step form, photo upload, lease details, amenities, publish validation
- Search results: filters, sorting, pagination, list layout
- Listing detail: photos, rent, dates, location, verification status, CTAs
- Conversation: listing context, messages, read receipts, offer cards
- Offer flow: create, counter, accept, reject
- Transaction dashboard: state, next actions, documents, landlord approval, payment, timeline
- Document center: upload, view permissions, download where allowed
- Landlord approval page: tokenized summary, approve/reject
- Notification center: unread list, click-through
- Settings: notification preferences, profile, verification status
- Moderation basics: report listing/user/message

## 8. Implementation Phases

### Phase 0: Product And Architecture Decisions

Target: 3 to 5 days

Deliverables:

- Confirm launch markets
- Confirm identity provider
- Confirm monetization model
- Confirm event bus choice after a small spike
- Confirm legal constraints for lease assignment and document templates
- Finalize module-level specs for Workflow and Documents first

Exit criteria:

- No P0 third-party integration is undecided
- Deal state machine is approved
- Initial database schema is reviewed

### Phase 1: Foundation

Target: weeks 1 to 3

Deliverables:

- Monorepo scaffold
- Local Docker Compose for Postgres, Redis, object storage, email sandbox
- Shared contracts package
- Database migrations and seed data
- Auth with session cookies
- Profile and verification status model
- Event outbox infrastructure
- Base app shell and navigation
- Analytics/event instrumentation wrapper

Exit criteria:

- User can sign up, sign in, complete profile, and hold a server session
- App can emit and persist domain events
- Local dev starts with one command

### Phase 2: Discovery

Target: weeks 3 to 6

Deliverables:

- Seller listing create/edit flow
- Photo upload pipeline
- Listing publish rules
- Search API and filters
- Search results UI
- Listing detail UI
- Address privacy gating
- Recent/recency sorting and pagination

Exit criteria:

- Verified seller can create and publish a listing
- Buyer can search, filter, and open listing detail
- Search performance is measured with seed data

### Phase 3: Chat And Offers

Target: weeks 6 to 9

Deliverables:

- Conversation model and API
- WebSocket gateway
- Message persistence
- Read receipts
- Listing-scoped chat UI
- Structured offer creation
- Offer cards and lifecycle actions
- Offer audit records

Exit criteria:

- Buyer can message seller from listing detail
- Buyer can send structured offer
- Seller can accept, reject, or counter
- Both parties see offer state consistently

### Phase 4: Transaction Workflow

Target: weeks 9 to 12

Deliverables:

- Deal creation from accepted offer
- Deal state machine service
- Transition guards
- Action-item engine
- Shared transaction dashboard
- Timeline and audit trail
- Cancellation and blocked flows
- Realtime deal state updates

Exit criteria:

- Accepted offer creates a deal
- Dashboard always shows current state and responsible next action
- Every transition is audit-logged and emits an event

### Phase 5: Documents, Landlord Approval, Payments

Target: weeks 12 to 15

Deliverables:

- Secure document upload
- Document access checks
- Seller lease reuse across deal conversations
- Buyer document requirements per listing
- Landlord approval request flow
- Tokenized landlord approval page
- Payment step using selected v1 model
- Document read audit logs

Exit criteria:

- Buyer in `documents_pending` can access seller lease
- Unauthorized users cannot access deal documents
- Landlord can approve or reject without account creation
- Deal can reach `transfer_complete`

### Phase 6: Notifications, Trust, Moderation

Target: weeks 15 to 17

Deliverables:

- Notification center
- Email notification adapter
- User notification preferences
- Reminder jobs for stalled deals
- Report and block flow
- Basic moderation queue
- Rate limits for listings, messages, and offers
- Structured logs and metrics dashboards

Exit criteria:

- All P0 workflow events notify relevant users
- Users can control notification preferences
- Abuse reporting path exists
- P0 observability dashboards are active

### Phase 7: Beta Hardening And Launch

Target: weeks 17 to 18+

Deliverables:

- Closed beta launch market configuration
- Load tests for search, chat, and deal updates
- Security review for document access and token links
- Analytics dashboards for PRD success metrics
- Error monitoring and alerting
- Launch checklist and rollback plan

Exit criteria:

- No open P0 bugs
- 10 internal or closed-beta deals completed
- Deal completion analytics are trusted
- Launch support playbook exists

## 9. Acceptance Checkpoints

Use these checkpoints before calling v1 complete:

- A seller can verify identity, create a listing, upload photos and lease, and publish
- A buyer can search listings, view detail, message a seller, and send a structured offer
- A seller can accept an offer and create a deal
- Buyer and seller can complete required documents
- Seller can request landlord approval
- Landlord can approve or reject through a single-use link
- Buyer and seller see synchronized deal state
- Payment status can be recorded
- Deal can reach `transfer_complete`
- All state transitions are audit-logged
- Notifications are emitted for every P0 state change
- Document access rules are enforced and logged
- Exact address remains gated until accepted offer

## 10. Testing Plan

Unit tests:

- Deal state transition guards
- Offer lifecycle rules
- Listing publish validation
- Document access policy
- Event payload validation
- Notification routing

Integration tests:

- Auth session flow
- Listing creation to search indexing
- Conversation creation and messaging
- Offer accepted to deal created
- Deal state progression
- Landlord token approval flow
- Unauthorized document access denial

End-to-end tests:

- Seller publishes listing
- Buyer finds listing and sends offer
- Seller accepts offer
- Buyer and seller complete documents
- Landlord approves
- Deal completes
- Cancellation flow
- Landlord rejection flow

Performance tests:

- Listing search p95 under 500 ms with seeded data
- Message delivery p95 under 1 second
- Deal update propagation p95 under 2 seconds
- Page FCP target under 1.5 seconds on broadband

## 11. Risks And Early Decisions

Highest-risk areas:

- Legal rules for lease assignment vary by market
- Identity provider choice affects onboarding friction and cost
- Document access control must be correct from day one
- Real-time consistency between chat, offers, deals, and notifications can become fragile
- Event bus choice should be abstracted to avoid deep vendor coupling
- Monetization must be decided before payment implementation

Early decisions needed:

- Launch cities
- Identity provider
- Payment model and who pays
- Verification requirement timing
- Required buyer document defaults
- Landlord approval email content and legal language
- Moderation operating model

## 12. First Sprint Backlog

Sprint 1 should focus on making the project real and reducing architectural risk.

Tasks:

- Scaffold monorepo
- Add local Docker Compose for Postgres and Redis
- Add API app and web app
- Add database migration setup
- Define initial schema for users, listings, conversations, offers, deals, documents, notifications, events
- Implement auth session skeleton
- Implement event outbox interface
- Implement deal state machine as a pure domain service with tests
- Draft module specs for Workflow and Documents
- Seed realistic listings and users for UI development

Sprint 1 demo:

- Start local stack
- Sign in as seeded seller and buyer
- View seeded listing list/detail
- Run deal state machine tests
- Show persisted domain event records

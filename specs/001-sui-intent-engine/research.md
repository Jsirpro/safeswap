# Research: SafeSwap Intent Engine on Sui

## Decision 1: Use a frontend/backend split with deterministic server-side control
- Decision: Implement the MVP as a web app with a separate backend control layer and a thin frontend wallet handoff.
- Rationale: The constitution forbids direct chat or AI paths to the wallet. Keeping parsing assistance and UX in the frontend while centralizing validation, quotes, guardian checks, PTB construction, and confirmation permissioning on the backend makes the state machine enforceable and auditable.
- Alternatives considered:
  - Pure frontend wallet app: rejected because it weakens enforcement of deterministic controls and remote whitelist checks.
  - Backend-only CLI/service: rejected because the product requires a user-facing bilingual preview and explicit wallet confirmation flow.

## Decision 2: Use TypeScript across frontend and backend
- Decision: Standardize on TypeScript 5.x for the full MVP.
- Rationale: Shared types for `SwapIntent`, preview payloads, guardian findings, and confirmation gates reduce drift between UI, contracts, and tests. It also aligns well with web delivery and Sui SDK usage.
- Alternatives considered:
  - Rust backend plus TypeScript frontend: rejected for MVP because it increases iteration cost before core product behavior is proven.
  - Python backend: rejected because it adds extra type-translation overhead for shared contract-heavy flows.

## Decision 3: Treat remote whitelist config as a required integration with unexpired cache fallback only
- Decision: Load supported asset pairs from a remote configuration source, cache them on the server with TTL, and block new flows when neither fresh remote data nor unexpired cache is available.
- Rationale: This satisfies the clarified requirement for dynamic whitelist updates while preserving fail-safe behavior. It also creates a stable validation boundary before quote fetching.
- Alternatives considered:
  - Static embedded whitelist: rejected because the spec requires dynamic updates.
  - Continue with expired cache: rejected because it can permit newly unsupported assets.
  - Real-time fetch on every request with no cache: rejected because it couples all intent parsing to remote config uptime.

## Decision 4: Make language handling explicit and session-scoped
- Decision: Support English and Chinese input and preview output, defaulting output language to the user's input language while allowing manual switching.
- Rationale: This preserves clarity for preview and error messaging without forcing dual-language rendering on every screen. It also gives deterministic expectations for tests.
- Alternatives considered:
  - English-only: rejected by clarification outcome.
  - Always show bilingual output: rejected because it increases UI density and can reduce preview readability.

## Decision 5: Define the core API around guarded state transitions
- Decision: Expose backend contracts for parse, quote, preview, confirm, and refresh operations rather than a single “swap now” endpoint.
- Rationale: The constitution requires the user-visible flow to remain explicit and testable. Stepwise endpoints make guardian and confirmation gates observable and contract-testable.
- Alternatives considered:
  - Single orchestrated “execute swap” endpoint: rejected because it obscures control boundaries.
  - GraphQL-only interface: rejected for MVP because a narrow state-machine API is clearer to validate.

## Decision 6: Use ephemeral server-side session state for flow integrity
- Decision: Keep short-lived session state for parsed intent, quote freshness, guardian results, preview snapshot, and confirmation eligibility in memory during MVP.
- Rationale: The clarified flow requires invalidating state on quote expiry, whitelist failure, or post-preview intent change. Ephemeral state is enough for MVP and avoids premature persistence design.
- Alternatives considered:
  - Persistent database-backed sessions: rejected as unnecessary MVP overhead.
  - Fully stateless round-tripping from client: rejected because it makes guarded invalidation and replay protection harder.

## Decision 7: Test contracts before implementation details
- Decision: Anchor testing around contract fixtures for intent parsing, whitelist validation, quote expiry, guardian blocking, preview correctness, bilingual output, confirmation gating, and mock mode.
- Rationale: The constitution requires schema -> contract -> tests -> implementation. Contract-first tests keep the deterministic boundaries stable while the implementation evolves.
- Alternatives considered:
  - UI-first tests only: rejected because they do not sufficiently prove backend guard behavior.
  - Unit-test-only approach: rejected because critical guarantees span multiple stages of the flow.

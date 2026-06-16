---

description: "Task list for SafeSwap Intent Engine on Sui implementation"
---

# Tasks: SafeSwap Intent Engine on Sui

**Input**: Design documents from `/specs/001-sui-intent-engine/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED. Every feature must include intent, validation, PTB, guardian, preview, confirmation, failure-path, and mock-mode coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Backend tests**: `backend/tests/contract/`, `backend/tests/integration/`, `backend/tests/unit/`
- **Frontend tests**: `frontend/tests/e2e/`, `frontend/tests/unit/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the web application structure, shared tooling, and contract-first scaffolding.

- [X] T001 Create the backend and frontend directory structure from the plan in `backend/src/`, `backend/tests/`, `frontend/src/`, and `frontend/tests/`
- [X] T002 Initialize workspace manifests and base scripts in `package.json`, `backend/package.json`, `frontend/package.json`, and `tsconfig.json`
- [X] T003 [P] Configure linting, formatting, and TypeScript build settings in `eslint.config.js`, `prettier.config.js`, `backend/tsconfig.json`, and `frontend/tsconfig.json`
- [X] T004 [P] Define shared Zod domain schemas for intent-engine entities in `backend/src/domain/schemas/intent.ts`, `backend/src/domain/schemas/quote.ts`, `backend/src/domain/schemas/guardian.ts`, and `backend/src/domain/schemas/preview.ts`
- [X] T005 [P] Add API contract fixtures and schema-validation helpers for the OpenAPI spec in `backend/tests/contract/intent-engine.openapi.test.ts` and `backend/tests/contract/fixtures/`
- [X] T006 Configure Vitest, Playwright, and shared test utilities in `backend/vitest.config.ts`, `frontend/vitest.config.ts`, `frontend/playwright.config.ts`, and `frontend/tests/e2e/support/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the deterministic state machine, remote whitelist integration, and guarded backend/frontend shell required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Implement backend API bootstrap and route registration in `backend/src/api/server.ts`, `backend/src/api/router.ts`, and `backend/src/api/http-error.ts`
- [X] T008 [P] Implement the in-memory flow session store for `SwapIntent`, `Quote`, `GuardianReport`, `HumanReadablePreview`, and `ConfirmationGate` in `backend/src/lib/flow-session-store.ts`
- [X] T009 [P] Implement the remote whitelist client with TTL cache and fail-safe behavior in `backend/src/integrations/whitelist/whitelist-client.ts` and `backend/src/integrations/whitelist/whitelist-cache.ts`
- [X] T010 [P] Implement shared localization utilities for English/Chinese parsing output, errors, and preview copy in `backend/src/lib/i18n.ts` and `frontend/src/services/i18n.ts`
- [X] T011 [P] Implement backend flow-state guards for quote expiry, preview invalidation, and confirmation revocation in `backend/src/domain/flow/flow-state-machine.ts`
- [X] T012 [P] Implement frontend swap session state and API client wrappers in `frontend/src/features/swap/store.ts` and `frontend/src/services/intent-engine-client.ts`
- [X] T013 Add a constitution guard test proving there is no wallet handoff before confirmation in `backend/tests/integration/guarded-flow.integration.test.ts`
- [X] T014 Add mock-mode infrastructure for backend and frontend flows in `backend/src/lib/mock-mode.ts`, `backend/src/integrations/quotes/mock-quote-provider.ts`, and `frontend/src/features/swap/mock-mode.ts`
- [X] T015 Document required runtime environment variables and local dev defaults in `.env.example`, `backend/src/lib/config.ts`, and `frontend/src/lib/config.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Describe a Swap Goal Naturally (Priority: P1) 🎯 MVP

**Goal**: Let a user enter an English or Chinese exact-input swap request, resolve ambiguity, and validate the request against supported scope and the remote whitelist before quoting.

**Independent Test**: Submit supported, ambiguous, unsupported, and whitelist-unverifiable requests and verify the system returns a validated intent or a localized corrective error without reaching quote generation.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T016 [P] [US1] Add contract tests for `POST /api/intents/parse` success and validation failure responses in `backend/tests/contract/parse-intent.contract.test.ts`
- [X] T017 [P] [US1] Add backend integration tests for English/Chinese parsing, ambiguity confirmation, and whitelist rejection in `backend/tests/integration/parse-intent.integration.test.ts`
- [X] T018 [P] [US1] Add frontend end-to-end tests for bilingual intent submission and ambiguity confirmation in `frontend/tests/e2e/us1-intent-entry.spec.ts`
- [X] T019 [P] [US1] Add failure-path and mock-mode tests for missing whitelist data in `backend/tests/unit/whitelist-validation.test.ts` and `frontend/tests/unit/swap-form-errors.test.tsx`

### Implementation for User Story 1

- [X] T020 [P] [US1] Implement the `SwapIntent`, `ValidationResult`, `WhitelistSnapshot`, and `SupportedPair` domain models in `backend/src/domain/intent/intent-model.ts` and `backend/src/domain/validation/validation-model.ts`
- [X] T021 [US1] Implement natural-language intent parsing and ambiguity detection in `backend/src/domain/intent/intent-parser.ts`
- [X] T022 [US1] Implement deterministic validation against scope, amount rules, and remote whitelist state in `backend/src/domain/validation/intent-validator.ts`
- [X] T023 [US1] Implement the parse endpoint and localized validation errors in `backend/src/api/routes/parse-intent.ts`
- [X] T024 [US1] Implement the frontend bilingual swap form, ambiguity confirmation panel, input-language defaulting, manual error-language switcher, and validation error rendering in `frontend/src/features/swap/components/swap-form.tsx`, `frontend/src/features/swap/components/intent-confirmation.tsx`, `frontend/src/features/swap/components/language-toggle.tsx`, and `frontend/src/app/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Review Risk and Transaction Preview (Priority: P2)

**Goal**: Turn a validated intent into a quote, run deterministic guardian checks, and present a localized preview that blocks execution on critical findings or expired quotes.

**Independent Test**: Generate a valid intent, request a quote, and verify the system returns guardian findings plus a localized preview; verify that critical risk or quote expiry prevents further progression.

### Tests for User Story 2 ⚠️

- [X] T025 [P] [US2] Add contract tests for `POST /api/intents/{intentId}/quote`, `POST /api/intents/{intentId}/preview`, and `POST /api/intents/{intentId}/refresh` in `backend/tests/contract/quote-preview.contract.test.ts`
- [X] T026 [P] [US2] Add backend integration tests for quote creation, expiry refresh, and guardian blocking in `backend/tests/integration/quote-preview.integration.test.ts`
- [X] T027 [P] [US2] Add frontend end-to-end tests for preview rendering and blocked execution scenarios in `frontend/tests/e2e/us2-preview-and-guardian.spec.ts`
- [X] T028 [P] [US2] Add unit tests for guardian severity mapping and localized preview generation in `backend/tests/unit/guardian-engine.test.ts` and `backend/tests/unit/preview-builder.test.ts`

### Implementation for User Story 2

- [X] T029 [P] [US2] Implement the `Quote`, `GuardianFinding`, `GuardianReport`, and `HumanReadablePreview` domain models in `backend/src/domain/quotes/quote-model.ts`, `backend/src/domain/guardian/guardian-model.ts`, and `backend/src/domain/preview/preview-model.ts`
- [X] T030 [US2] Implement the quote provider integration and quote refresh service in `backend/src/integrations/quotes/quote-provider.ts` and `backend/src/domain/quotes/quote-service.ts`
- [X] T031 [US2] Implement deterministic guardian evaluation for high slippage, low liquidity, stale route/quote, and price deviation in `backend/src/domain/guardian/guardian-engine.ts`
- [X] T032 [US2] Implement PTB compilation and localized preview construction in `backend/src/domain/transactions/ptb-compiler.ts` and `backend/src/domain/preview/preview-builder.ts`
- [X] T033 [US2] Implement quote, preview, and refresh endpoints with quote-expiry invalidation logic in `backend/src/api/routes/create-quote.ts`, `backend/src/api/routes/create-preview.ts`, and `backend/src/api/routes/refresh-quote.ts`
- [X] T034 [US2] Implement the frontend quote summary, guardian findings panel, bilingual preview UI, and manual preview-language switching in `frontend/src/features/swap/components/quote-summary.tsx`, `frontend/src/features/swap/components/guardian-findings.tsx`, `frontend/src/features/swap/components/preview-card.tsx`, and `frontend/src/features/swap/components/language-toggle.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Confirm Before Signing (Priority: P3)

**Goal**: Require explicit confirmation before wallet handoff, revoke confirmation on post-preview changes, and preserve no-bypass wallet access guarantees.

**Independent Test**: Move from a valid preview to confirmation, verify wallet handoff is available only after confirmation, and verify post-preview changes or cancellation revoke permission immediately.

### Tests for User Story 3 ⚠️

- [X] T035 [P] [US3] Add contract tests for `POST /api/intents/{intentId}/confirm` wallet-permission responses in `backend/tests/contract/confirm-preview.contract.test.ts`
- [X] T036 [P] [US3] Add backend integration tests for confirmation approval, cancellation, and post-preview invalidation in `backend/tests/integration/confirm-preview.integration.test.ts`
- [X] T037 [P] [US3] Add frontend end-to-end tests for confirmation gating and wallet handoff behavior in `frontend/tests/e2e/us3-confirm-and-sign.spec.ts`
- [X] T038 [P] [US3] Add mock-mode regression tests proving no live wallet signature is requested in `backend/tests/integration/mock-mode.integration.test.ts` and `frontend/tests/unit/wallet-gate.test.tsx`

### Implementation for User Story 3

- [X] T039 [P] [US3] Implement the `ConfirmationGate` model and confirmation permission service in `backend/src/domain/confirmation/confirmation-model.ts` and `backend/src/domain/confirmation/confirmation-service.ts`
- [X] T040 [US3] Implement the confirm endpoint and wallet payload handoff guard in `backend/src/api/routes/confirm-preview.ts` and `backend/src/domain/transactions/wallet-handoff.ts`
- [X] T041 [US3] Implement frontend confirmation controls and wallet handoff trigger in `frontend/src/features/swap/components/confirmation-gate.tsx` and `frontend/src/features/swap/components/wallet-handoff-button.tsx`
- [X] T042 [US3] Implement post-preview intent edit invalidation and restart behavior in `frontend/src/features/swap/components/swap-editor.tsx` and `backend/src/domain/flow/intent-invalidation.ts`
- [X] T043 [US3] Integrate Sui wallet signing only after backend permission is granted in `frontend/src/services/sui-wallet.ts` and `frontend/src/features/swap/hooks/use-wallet-handoff.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Harden the full feature, validate documentation, and prepare the MVP for implementation handoff.

- [ ] T044 [P] Add end-to-end quickstart validation notes and screenshots to `specs/001-sui-intent-engine/quickstart.md` and `frontend/tests/e2e/artifacts/README.md`
- [X] T045 Run a constitution compliance audit across `backend/src/`, `frontend/src/`, and `/home/solana/programs/safeswap/specs/001-sui-intent-engine/` and record outcomes in `specs/001-sui-intent-engine/tasks.md`
- [X] T046 [P] Add performance and regression coverage for parse latency, quote-to-preview timing, and confirmation-gate latency in `backend/tests/integration/performance.integration.test.ts`
- [X] T047 [P] Add a bilingual preview-comprehension validation script and result rubric for `SC-005` in `specs/001-sui-intent-engine/quickstart.md` and `frontend/tests/e2e/fixtures/preview-comprehension-checklist.json`
- [X] T048 [P] Add final documentation for remote whitelist operations, mock mode, and bilingual preview behavior in `README.md` and `.env.example`
- [ ] T049 Run the full quickstart scenario suite and capture final verification notes in `specs/001-sui-intent-engine/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories should proceed sequentially in priority order for MVP safety (`US1 -> US2 -> US3`)
  - Individual tasks inside a story still expose parallel work where marked `[P]`
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and establishes the parse/validate/whitelist baseline
- **User Story 2 (P2)**: Depends on US1 because quote, guardian, and preview require validated intents
- **User Story 3 (P3)**: Depends on US2 because confirmation requires an existing preview and guardian result

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Domain models and schemas before route/controller wiring
- Backend services before frontend integration
- Intent validation before quote generation
- Quote generation before PTB compilation and guardian review
- Guardian and PTB completion before preview generation
- Preview generation before explicit confirmation
- Confirmation before wallet handoff

### Parallel Opportunities

- `T003`, `T004`, `T005`, and `T006` can run in parallel after workspace manifests exist
- `T008`, `T009`, `T010`, `T011`, `T012`, and `T014` can run in parallel within the foundational phase
- Story test tasks marked `[P]` can run in parallel before each story’s implementation work begins
- Backend and frontend implementation tasks that touch separate files can run in parallel after their shared service dependencies are satisfied

---

## Parallel Example: User Story 1

```bash
Task: "T016 [US1] Add contract tests for POST /api/intents/parse in backend/tests/contract/parse-intent.contract.test.ts"
Task: "T017 [US1] Add backend integration tests in backend/tests/integration/parse-intent.integration.test.ts"
Task: "T018 [US1] Add frontend end-to-end tests in frontend/tests/e2e/us1-intent-entry.spec.ts"
Task: "T019 [US1] Add failure-path and mock-mode tests in backend/tests/unit/whitelist-validation.test.ts and frontend/tests/unit/swap-form-errors.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T025 [US2] Add contract tests in backend/tests/contract/quote-preview.contract.test.ts"
Task: "T026 [US2] Add backend integration tests in backend/tests/integration/quote-preview.integration.test.ts"
Task: "T027 [US2] Add frontend end-to-end tests in frontend/tests/e2e/us2-preview-and-guardian.spec.ts"
Task: "T028 [US2] Add unit tests in backend/tests/unit/guardian-engine.test.ts and backend/tests/unit/preview-builder.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T035 [US3] Add contract tests in backend/tests/contract/confirm-preview.contract.test.ts"
Task: "T036 [US3] Add backend integration tests in backend/tests/integration/confirm-preview.integration.test.ts"
Task: "T037 [US3] Add frontend end-to-end tests in frontend/tests/e2e/us3-confirm-and-sign.spec.ts"
Task: "T038 [US3] Add mock-mode regression tests in backend/tests/integration/mock-mode.integration.test.ts and frontend/tests/unit/wallet-gate.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify bilingual parsing, ambiguity confirmation, and whitelist validation independently
5. Demo the intent engine entry flow before moving to quoting

### Incremental Delivery

1. Complete Setup + Foundational -> guarded baseline ready
2. Add User Story 1 -> Validate bilingual intent entry and whitelist enforcement
3. Add User Story 2 -> Validate quote, guardian, and preview flow
4. Add User Story 3 -> Validate explicit confirmation and wallet handoff gating
5. Finish Polish -> run quickstart suite and compliance audit

### Parallel Team Strategy

With multiple developers:

1. Developer A: backend domain/services
2. Developer B: frontend flow and UI
3. Developer C: contract, integration, and end-to-end test coverage
4. Rejoin at each story checkpoint to verify no wallet bypass or invalidation regressions

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps each task to its user story for traceability
- Every user story includes explicit test, implementation, and validation tasks
- All tasks include exact file paths and are immediately actionable
- Avoid introducing any direct wallet path outside the confirmation gate
- Suggested MVP scope: complete through **Phase 3 / User Story 1** before expanding to quoting and signing


## Constitution Audit

Recorded on June 16, 2026.
- Intent parsing exists in `backend/src/domain/intent/intent-parser.ts` and `POST /api/intents/parse`.
- PTB compilation exists in `backend/src/domain/transactions/ptb-compiler.ts`.
- Guardian executes before preview confirmation and blocks critical routes.
- Human-readable preview exists and is bilingual.
- Explicit confirmation is required before wallet handoff.
- No direct wallet route exists in the backend API.
- Mock mode works for whitelist, quote, and wallet-signature simulation.
- Remaining environment blocker: Playwright browser binaries are not installed, so final browser quickstart execution is still pending.

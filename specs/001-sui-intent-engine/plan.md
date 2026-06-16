# Implementation Plan: SafeSwap Intent Engine on Sui

**Branch**: `001-sui-intent-engine` | **Date**: 2026-06-16 | **Spec**: [/home/solana/programs/safeswap/specs/001-sui-intent-engine/spec.md](/home/solana/programs/safeswap/specs/001-sui-intent-engine/spec.md)
**Input**: Feature specification from `/specs/001-sui-intent-engine/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a bilingual Sui web application that turns English or Chinese swap requests
into validated `SwapIntent` records, fetches quotes for remotely whitelisted
assets, compiles PTBs, runs deterministic guardian checks, generates a
human-readable preview, and only then hands an approved transaction to the wallet
for signature. The design separates user-facing AI-assisted parsing from
fully deterministic validation, quote handling, guardian logic, PTB compilation,
and confirmation gating.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 15 + React 19 for the web app, Sui TypeScript SDK for chain interactions, Zod for schema validation, TanStack Query for client/server data flows  
**Storage**: No persistent database in MVP; time-bounded in-memory server cache for remote whitelist data and short-lived quote/session state  
**Testing**: Vitest for unit/integration tests, Playwright for end-to-end flows, contract tests against OpenAPI and schema fixtures  
**Target Platform**: Modern desktop/mobile browsers with a Node.js 20 web runtime and Sui wallet integration  
**Project Type**: Web application  
**Performance Goals**: Parse/validate responses under 1s p95, quote-to-preview under 3s p95 in mock mode, confirmation gate decisions under 500ms p95  
**Constraints**: Exact-input swaps only; English/Chinese support; remote whitelist must use only unexpired cache; no direct wallet path before explicit confirmation; Guardian and PTB logic must be deterministic; current flow state invalidates on quote expiry or post-preview intent change  
**Scale/Scope**: MVP for single-user swap sessions over a remotely managed whitelist of mainstream Sui asset pairs; optimized for tens of concurrent sessions rather than high-volume automated trading

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Intent-first architecture is preserved: `Intent -> Validate -> Quote -> PTB -> Guardian -> Preview -> Confirm -> Wallet`.
- [x] No direct path exists from chat, AI output, intent, quote, or PTB stages to the wallet.
- [x] The design includes all four mandatory controls: Intent, PTB, Guardian, and Confirmation.
- [x] Critical logic remains deterministic; AI is limited to parsing, explanation, and translation.
- [x] Human-readable preview requirements are defined for wallet inputs, outputs, route, minimum output, failure conditions, and guardian findings.
- [x] Delivery order is explicit: schema, contracts, tests, then implementation.
- [x] Test coverage includes intent, validation, PTB, guardian, preview, confirmation, failure handling, and mock mode.
- [x] MVP scope remains limited to exact-input swaps unless the constitution is amended.

Post-design re-check: PASS. The generated data model, contracts, and quickstart all preserve the same guarded flow and do not introduce a wallet bypass.

## Project Structure

### Documentation (this feature)

```text
specs/001-sui-intent-engine/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── intent-engine.openapi.yaml
│   └── domain-schemas.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── domain/
│   │   ├── intent/
│   │   ├── validation/
│   │   ├── quotes/
│   │   ├── guardian/
│   │   ├── preview/
│   │   ├── confirmation/
│   │   └── transactions/
│   ├── integrations/
│   │   ├── sui/
│   │   ├── quotes/
│   │   └── whitelist/
│   └── lib/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/swap/
│   └── services/
└── tests/
    ├── e2e/
    └── unit/
```

**Structure Decision**: Choose the web application split. The backend owns deterministic swap controls, remote whitelist caching, quote orchestration, guardian evaluation, PTB compilation, and confirmation permissioning. The frontend owns bilingual input, intent-confirm UI, preview rendering, explicit confirmation, and wallet handoff only after backend approval.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required at planning time.

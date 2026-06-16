<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles: placeholder principles replaced with SafeSwap-specific governance
- Added sections: Architecture Invariants; Delivery Workflow & Quality Gates
- Removed sections: none
- Templates requiring updates:
  ✅ updated - .specify/templates/plan-template.md
  ✅ updated - .specify/templates/spec-template.md
  ✅ updated - .specify/templates/tasks-template.md
  ✅ no command templates present - .specify/templates/commands/
- Follow-up TODOs: none
-->
# SafeSwap Intent Engine Constitution

## Core Principles

### I. Intent-First Execution
Every swap feature MUST begin with a structured `SwapIntent` derived from natural
language and MUST preserve that intent through validation, quote generation, PTB
compilation, guardian review, preview generation, and confirmation. Direct flows
from chat, AI output, quote data, or raw PTB state to the wallet are forbidden.
This keeps the product aligned with SafeSwap's mission and prevents swap-bot style
behavior.

### II. Four Mandatory Controls
Every implementation MUST contain all of the following controls: Intent, PTB,
Guardian, and Confirmation. If any control is absent, bypassed, or replaced with
an implicit equivalent, the implementation is invalid and MUST NOT ship. Guardian
review MUST execute before signature, and explicit user confirmation MUST execute
before any permission to sign is granted.

### III. Deterministic Risk and Transaction Logic
AI may parse, translate, and explain user requests, but AI MUST NOT calculate
slippage, approve risk, build final PTB logic, or trigger signing. Slippage,
liquidity checks, route validation, PTB construction, execution gating, and other
critical controls MUST be deterministic and testable. This preserves auditability
and prevents probabilistic behavior in security-sensitive paths.

### IV. Schema -> Contract -> Tests -> Implementation
Implementation work MUST follow this order: schema definition, contract design,
test definition, then production code. Prompt-to-code generation without explicit
schema, contract, and tests is forbidden. Each feature MUST include intent,
validation, PTB, guardian, preview, confirmation, failure-path, and mock-mode
test coverage before it is considered complete.

### V. Human-Readable Consent
Every PTB MUST produce a human-readable preview before confirmation. The preview
MUST explain what leaves the wallet, what enters the wallet, expected output,
minimum output, execution route, failure conditions, and guardian risk findings.
Wallet connection is not consent, quote retrieval is not consent, and auto-sign or
auto-execute behaviors are forbidden. Users MUST be able to understand what will
happen without reading raw PTB data.

## Architecture Invariants
The following execution order is mandatory for every swap flow:

`Intent -> Validate -> Quote -> PTB -> Guardian -> Preview -> Confirm -> Wallet`

The following paths are forbidden:

- `Chat -> Wallet`
- `AI -> Wallet`
- `Intent -> Wallet`
- `Quote -> Wallet`
- `PTB -> Wallet`

Guardian may never be bypassed.

Confirmation may never be bypassed.

MVP scope is limited to exact-input swaps expressed in natural language, such as
`Swap 10 SUI to USDC`. Bridge, lending, yield, perpetuals, liquidity management,
and autonomous trading flows are out of scope until this constitution is amended.

## Delivery Workflow & Quality Gates
Before implementation begins, each feature specification MUST define the swap
intent schema, the external and internal contracts needed to satisfy that schema,
and the tests that prove the feature cannot bypass validation, guardian review,
preview generation, or explicit confirmation. Plans MUST include a constitution
check that rejects any design capable of reaching the wallet directly.

A feature is done only when all of the following are true:

- Intent parsing exists.
- Validation exists.
- PTB compilation exists.
- Guardian review runs and blocks critical findings.
- Human-readable preview exists.
- Explicit confirmation exists.
- Automated tests cover intent, validation, PTB, guardian, preview, confirmation,
  failure handling, and mock mode.
- Mock mode works without wallet signing.
- The wallet cannot be reached directly from chat, AI, intent, quote, or PTB
  stages.

## Governance
This constitution supersedes conflicting local workflow preferences for SafeSwap.
Changes MUST be proposed as documented amendments to this file and MUST include
any required updates to affected Spec Kit templates before adoption.

Versioning policy for this constitution follows semantic versioning:

- MAJOR: Removes or materially redefines a principle or mandatory gate.
- MINOR: Adds a new principle, mandatory section, or materially expanded rule.
- PATCH: Clarifies wording without changing governance requirements.

Compliance review is mandatory for every feature plan, specification, and task
list. Any artifact that omits the Intent -> PTB -> Guardian -> Confirmation model,
allows wallet access without explicit confirmation, or downgrades deterministic
controls below AI behavior is non-compliant and MUST be corrected before work
continues.

**Version**: 1.0.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16

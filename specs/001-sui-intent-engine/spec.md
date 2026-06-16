# Feature Specification: SafeSwap Intent Engine on Sui

**Feature Branch**: `001-sui-intent-engine`  
**Created**: 2026-06-16  
**Status**: Draft  
**Input**: User description: "Build SafeSwap Intent Engine on Sui.

Users describe swap goals in natural language.

The system converts them into validated intents,
fetches quotes,
compiles PTBs,
runs Guardian risk checks,
generates human-readable previews,
requires explicit confirmation,
and only then requests wallet signature.

This is an Intent Engine, not a swap bot."

## Clarifications

### Session 2026-06-16

- Q: MVP 支持的交易资产范围是什么？ → A: 仅支持预先白名单中的 Sui 生态主流资产对
- Q: 当用户输入存在歧义时，系统应该怎么处理？ → A: 先展示解析结果并要求用户确认意图，再继续
- Q: MVP 中哪些风险必须被 Guardian 视为 `CRITICAL` 并阻止签名？ → A: 高滑点、低流动性、陈旧报价或路由、明显价格偏离
- Q: 报价过期后，系统应该怎么处理？ → A: 阻止继续签名，要求重新获取报价并重新走 Guardian/Preview
- Q: 用户在预览后修改交换内容时，系统应该怎么处理？ → A: 作废当前流程，从意图校验/报价重新开始
- Q: MVP 的资产白名单来源应该是什么？ → A: 远程配置白名单，可动态更新
- Q: 远程白名单读取失败或过期时，系统应如何处理？ → A: 仅允许使用未过期缓存；没有有效缓存就阻止新流程
- Q: 如果远程白名单在用户流程进行中发生变化，何时生效最合适？ → A: 仅对新启动的流程生效；当前已通过校验的流程继续
- Q: MVP 面向用户的自然语言输入与预览输出支持哪些语言？ → A: 中英双语
- Q: 预览与错误提示的语言应如何决定？ → A: 默认跟随用户输入语言，并允许手动切换中/英

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Describe a Swap Goal Naturally (Priority: P1)

A user describes a desired Sui swap in natural language, such as exchanging one
asset for another by amount, and receives a validated interpretation of that goal
before any wallet request is shown.

**Why this priority**: The product has no value unless users can express swap
intent naturally and receive a trustworthy interpretation of what they asked to do.

**Independent Test**: Can be fully tested by submitting a supported swap request
in English or Chinese and confirming the system produces a validated intent with
clear error feedback for invalid, unsupported, non-whitelisted, ambiguous asset,
or missing-valid-whitelist-data requests.

**Acceptance Scenarios**:

1. **Given** a user enters a supported exact-input swap request in English or
   Chinese for a whitelisted asset pair, **When** the system processes the
   request, **Then** it returns a validated swap intent that clearly identifies
   the input asset, output asset, and input amount.
2. **Given** a user enters an ambiguous request in English or Chinese that can be
   parsed into a likely swap intent, **When** the system detects ambiguity,
   **Then** it presents the interpreted intent and requires the user to confirm
   that intent before validation continues.
3. **Given** a user enters an incomplete, unsupported, non-whitelisted, or
   whitelist-unverifiable request, **When** the system processes the request,
   **Then** it refuses to proceed to quoting and explains what must be corrected
   in the user's selected language.

---

### User Story 2 - Review Risk and Transaction Preview (Priority: P2)

A user who has submitted a valid swap goal receives a quote, a risk assessment,
and a human-readable preview that explains the transaction outcome before any
signature request is possible.

**Why this priority**: Users must understand the economic result and any material
risk before they are asked to authorize a transaction.

**Independent Test**: Can be tested by generating a valid swap intent and
verifying that the system presents quote details, guardian findings, and a
complete preview while blocking execution on critical risk findings or expired
quotes.

**Acceptance Scenarios**:

1. **Given** a validated swap intent with an available quote, **When** the system
   prepares the transaction, **Then** it presents expected output, minimum output,
   route summary, failure conditions, and guardian findings in human-readable form
   in English or Chinese.
2. **Given** guardian review detects high slippage, low liquidity, stale quote or
   route data, or material price deviation, **When** preview is generated,
   **Then** the system marks the finding as critical, blocks the user from
   proceeding to signature, and clearly explains why execution is stopped in the
   user's selected language.
3. **Given** a quote has expired before signature, **When** the user tries to
   continue, **Then** the system blocks signing, requires a refreshed quote, and
   repeats guardian review and preview before confirmation can resume.

---

### User Story 3 - Confirm Before Signing (Priority: P3)

A user who understands the preview and accepts the quoted trade explicitly
confirms the action and is only then allowed to hand off to the wallet for
signature.

**Why this priority**: SafeSwap must guarantee that wallet interaction is the end
of an informed consent flow rather than a shortcut from AI output to execution.

**Independent Test**: Can be tested by moving from a valid preview to explicit
confirmation and verifying that wallet signing is unavailable before confirmation
and available only after confirmation is given.

**Acceptance Scenarios**:

1. **Given** a valid preview with no blocking guardian findings, **When** the
   user explicitly confirms the transaction, **Then** the system may request a
   wallet signature.
2. **Given** a valid preview with no blocking guardian findings, **When** the
   user changes the swap amount, input asset, output asset, or other transaction
   intent details, **Then** the system invalidates the current quote, guardian
   findings, preview, and pending confirmation state, and restarts from intent
   validation and quote generation.
3. **Given** a remote whitelist update occurs after a flow has already passed
   whitelist validation, **When** the user continues that in-progress flow,
   **Then** the current validated flow may continue unchanged, and the whitelist
   update applies only to newly started flows.
4. **Given** a valid preview with no blocking guardian findings, **When** the
   user does not confirm or cancels, **Then** the system must not request a
   wallet signature or execute the transaction.

### Edge Cases

- What happens when natural-language input names an unsupported asset, a
  non-whitelisted asset, omits an amount, or expresses a non-swap action such as
  bridging or lending?
- What happens when the system can infer a likely swap intent but the user's
  original request remains ambiguous?
- How does the system respond when a quote is unavailable, expires, or no longer
  matches the validated intent?
- What happens when the remote whitelist is unavailable, stale, or changes during
  an in-progress swap flow?
- What happens when the user input language or requested preview language is
  English or Chinese and the system cannot confidently explain the trade?
- What happens when guardian checks detect high slippage, low liquidity, stale
  routing information, or price deviation?
- How does the system behave when the preview cannot explain a required part of
  the transaction clearly enough for human review?
- What happens when the user changes the requested swap after quote generation or
  after preview is shown?
- How does the system behave in mock mode when live wallet interaction is not
  available?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept natural-language requests for Sui exact-input
  swaps in English and Chinese and transform each supported request into a
  structured swap intent before any quote, transaction preview, or wallet step
  occurs.
- **FR-002**: The system MUST validate each swap intent for supported scope,
  required fields, asset pair, whitelist eligibility, amount presence, and
  exact-input eligibility before requesting a quote.
- **FR-003**: The system MUST detect when a request remains materially ambiguous
  after parsing and MUST present the interpreted swap intent for explicit user
  confirmation before continuing to validation and quoting.
- **FR-004**: The system MUST reject requests for bridging, lending, yield,
  perpetuals, liquidity management, autonomous trading, or any other non-swap
  action that is outside the approved MVP scope.
- **FR-005**: The system MUST reject asset requests that fall outside the
  remotely managed whitelist of supported Sui ecosystem asset pairs.
- **FR-006**: The system MUST obtain whitelist data from a remote configuration
  source that can be updated without redeploying the application.
- **FR-007**: The system MUST maintain a time-bounded local cache of the remote
  whitelist and MAY use it only while it remains unexpired.
- **FR-008**: The system MUST fail safely when remote whitelist data is
  unavailable and no valid unexpired whitelist cache exists, and MUST NOT
  continue with assets whose support status cannot be determined.
- **FR-009**: A whitelist update that arrives after an in-progress flow has
  already passed whitelist validation MUST apply only to newly started flows and
  MUST NOT silently invalidate the current in-progress flow.
- **FR-010**: The system MUST obtain a quote only from validated intent data and
  MUST stop the flow when a quote is unavailable, expired, or inconsistent with
  the validated intent.
- **FR-011**: When a quote expires, the system MUST block signing, require a new
  quote, and re-run guardian review and human-readable preview before the user can
  confirm again.
- **FR-012**: The system MUST compile a transaction request only after a valid
  intent and quote are present.
- **FR-013**: The system MUST run guardian checks before any signing request and
  MUST classify findings as informational, warning, or critical.
- **FR-014**: The system MUST classify high slippage, low liquidity, stale quote
  or route data, and material price deviation as critical findings that block
  signing.
- **FR-015**: The system MUST block execution when guardian review produces a
  critical finding.
- **FR-016**: The system MUST generate a human-readable preview for every
  transaction request before confirmation is possible.
- **FR-017**: The system MUST generate previews and user-facing error messages in
  English and Chinese, defaulting to the user's input language while allowing the
  user to manually switch between the two supported languages.
- **FR-018**: The system MUST require explicit user confirmation after preview and
  before any wallet signature request is shown.
- **FR-019**: The system MUST ensure wallet connection, quote retrieval, or AI
  interpretation alone are never treated as user consent to sign or execute.
- **FR-020**: The system MUST prevent direct paths from chat, AI output, intent,
  quote, or transaction compilation stages to the wallet.
- **FR-021**: The system MUST support a mock mode that exercises the full intent,
  validation, quote, guardian, preview, and confirmation flow without requesting a
  live wallet signature.
- **FR-022**: The system MUST invalidate the current quote, guardian findings,
  preview, and pending confirmation state whenever the user changes swap content
  after preview, and MUST restart from intent validation and quote generation.
- **FR-023**: The system MUST preserve enough user-facing detail throughout the
  flow for a person to understand the proposed trade without needing to inspect
  protocol-specific transaction data.

### Key Entities *(include if feature involves data)*

- **SwapIntent**: The structured representation of a user's natural-language swap
  goal, including the source asset, destination asset, input amount, and scope
  constraints.
- **ValidationResult**: The outcome of checking whether a parsed intent is
  complete, supported, and eligible to move into quoting.
- **Quote**: The proposed swap outcome associated with a validated intent,
  including expected and minimum proceeds and route context.
- **SwapContext**: The combined set of validated intent data, quote details,
  transaction request data, and market context used for guardian review.
- **GuardianFinding**: A single risk observation with severity and explanation.
- **GuardianFindings**: The full set of guardian results that inform or block the
  transaction.
- **HumanReadablePreview**: The user-facing explanation of the proposed swap,
  including asset movement, route, expected results, risks, and failure
  conditions.
- **ExecutionPermission**: The explicit post-confirmation state that allows the
  system to request a wallet signature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of supported exact-input swap requests entered in
  English or Chinese are converted into a validated intent or a clear corrective
  error on the first attempt.
- **SC-002**: 100% of signature requests are preceded by validated intent,
  successful quote retrieval, guardian review, human-readable preview, and
  explicit user confirmation.
- **SC-003**: 100% of transactions presented for confirmation include preview
  details for wallet outflow, wallet inflow, expected output, minimum output,
  route summary, failure conditions, and guardian findings.
- **SC-004**: 100% of critical guardian findings stop the flow before any wallet
  signature request is shown.
- **SC-005**: At least 90% of test users can correctly describe what they will
  send, what they will receive, and the main execution risks after reviewing the
  preview in their selected supported language.
- **SC-006**: 100% of mock-mode runs complete the full consent flow without
  invoking a live wallet signature.

## Assumptions

- The initial release supports exact-input Sui swaps only.
- Supported swaps are limited to a remotely managed whitelist of mainstream Sui
  ecosystem asset pairs.
- User-facing natural-language input and preview output are supported in English
  and Chinese.
- Preview and error-message language default to the user's input language and can
  be manually switched between English and Chinese.
- Users submit one swap goal at a time and expect the system to guide them from
  intent understanding through confirmation.
- Guardian review is part of every supported swap flow and may block execution
  when risk is unacceptable.
- Users are expected to provide explicit confirmation for each transaction rather
  than relying on persistent standing approval.
- Live execution depends on a wallet being available, but the product must remain
  testable in mock mode without one.

# Data Model: SafeSwap Intent Engine on Sui

## Entity: SwapIntent
- Purpose: Canonical representation of the user's requested exact-input swap before quoting.
- Fields:
  - `intentId`: string, unique per flow
  - `sourceText`: string, original user request
  - `inputLanguage`: enum (`en`, `zh`)
  - `outputLanguage`: enum (`en`, `zh`)
  - `inputAssetSymbol`: string
  - `inputAssetType`: string
  - `outputAssetSymbol`: string
  - `outputAssetType`: string
  - `inputAmount`: decimal string
  - `swapMode`: enum (`exact_input`)
  - `ambiguityStatus`: enum (`clear`, `needs_confirmation`)
  - `userConfirmedInterpretation`: boolean
  - `status`: enum (`parsed`, `validated`, `invalidated`)
  - `createdAt`: ISO datetime
- Validation rules:
  - `swapMode` must always be `exact_input` in MVP.
  - Asset pair must exist in the active whitelist snapshot.
  - `inputAmount` must be present and greater than zero.
  - Ambiguous intents cannot enter quote generation until confirmed.

## Entity: WhitelistSnapshot
- Purpose: Server-side view of the remotely managed asset whitelist used during validation.
- Fields:
  - `version`: string
  - `source`: string
  - `fetchedAt`: ISO datetime
  - `expiresAt`: ISO datetime
  - `status`: enum (`fresh`, `cached`, `expired`, `unavailable`)
  - `supportedPairs`: array of `SupportedPair`
- Validation rules:
  - Snapshot is usable only when current time is before `expiresAt`.
  - Missing or expired snapshot blocks new flows.
- Relationships:
  - One snapshot contains many supported pairs.

## Entity: SupportedPair
- Purpose: Whitelisted asset pair configuration entry.
- Fields:
  - `pairId`: string
  - `inputAssetType`: string
  - `outputAssetType`: string
  - `displayInputSymbol`: string
  - `displayOutputSymbol`: string
  - `enabled`: boolean
- Validation rules:
  - Pair must be enabled to pass validation.

## Entity: ValidationResult
- Purpose: Deterministic validation outcome for a parsed intent.
- Fields:
  - `intentId`: string
  - `isValid`: boolean
  - `failureCode`: enum or null
  - `failureMessage`: localized string or null
  - `validatedPairId`: string or null
  - `whitelistVersion`: string
  - `validatedAt`: ISO datetime
- Validation rules:
  - `failureCode` and `failureMessage` must exist when `isValid` is `false`.

## Entity: Quote
- Purpose: Quoted economic result for a validated intent.
- Fields:
  - `quoteId`: string
  - `intentId`: string
  - `routeId`: string
  - `expectedOutputAmount`: decimal string
  - `minimumOutputAmount`: decimal string
  - `estimatedSlippageBps`: integer
  - `routeSummary`: string
  - `providerTimestamp`: ISO datetime
  - `expiresAt`: ISO datetime
  - `status`: enum (`active`, `expired`, `replaced`)
- Validation rules:
  - Quote must be active and unexpired before preview or confirmation.
  - Quote data must match validated intent amounts and assets.

## Entity: GuardianFinding
- Purpose: One deterministic risk observation for the pending transaction.
- Fields:
  - `findingId`: string
  - `intentId`: string
  - `severity`: enum (`info`, `warning`, `critical`)
  - `category`: enum (`high_slippage`, `low_liquidity`, `stale_route`, `price_deviation`, `other`)
  - `message`: localized string
  - `blocking`: boolean
- Validation rules:
  - `blocking` must be `true` for all `critical` findings.
  - `high_slippage`, `low_liquidity`, `stale_route`, and `price_deviation` must map to `critical` in MVP.

## Entity: GuardianReport
- Purpose: Aggregate guardian result for a specific quote/PTB snapshot.
- Fields:
  - `intentId`: string
  - `quoteId`: string
  - `findings`: array of `GuardianFinding`
  - `overallSeverity`: enum (`info`, `warning`, `critical`)
  - `canProceedToPreview`: boolean
  - `evaluatedAt`: ISO datetime
- Validation rules:
  - `canProceedToPreview` must be `false` when `overallSeverity` is `critical`.

## Entity: PTBArtifact
- Purpose: Deterministic transaction payload prepared for preview and eventual wallet handoff.
- Fields:
  - `ptbId`: string
  - `intentId`: string
  - `quoteId`: string
  - `serializedTransaction`: string
  - `routeSummary`: string
  - `walletOutflow`: array of asset/amount entries
  - `walletInflow`: array of asset/amount entries
  - `status`: enum (`compiled`, `invalidated`)
  - `compiledAt`: ISO datetime
- Validation rules:
  - PTB can only be compiled from a validated intent and active quote.
  - PTB must be invalidated when the quote expires or the user changes the swap.

## Entity: HumanReadablePreview
- Purpose: User-facing explanation of the proposed transaction.
- Fields:
  - `previewId`: string
  - `intentId`: string
  - `quoteId`: string
  - `language`: enum (`en`, `zh`)
  - `walletOutflowText`: string
  - `walletInflowText`: string
  - `expectedOutputText`: string
  - `minimumOutputText`: string
  - `routeText`: string
  - `failureConditionsText`: string
  - `guardianFindingsText`: array of strings
  - `generatedAt`: ISO datetime
- Validation rules:
  - Preview must exist before explicit confirmation is allowed.
  - Preview must include all mandatory disclosure fields in the selected language.

## Entity: ConfirmationGate
- Purpose: Explicit user consent state for a specific preview snapshot.
- Fields:
  - `intentId`: string
  - `previewId`: string
  - `userConfirmed`: boolean
  - `confirmedAt`: ISO datetime or null
  - `status`: enum (`pending`, `approved`, `invalidated`)
- Validation rules:
  - Approval is only valid for the exact preview snapshot shown to the user.
  - Gate must invalidate when quote, whitelist validity, or intent state changes.

## Relationships
- `SwapIntent` -> one `ValidationResult`
- `SwapIntent` -> zero or many `Quote` records over refresh cycles
- `Quote` -> one `GuardianReport`
- `Quote` -> one `PTBArtifact`
- `PTBArtifact` -> one or more `HumanReadablePreview` records by language
- `HumanReadablePreview` -> one `ConfirmationGate`
- `ValidationResult` references one `WhitelistSnapshot`

## State Transitions
- `SwapIntent`: `parsed` -> `validated` -> `invalidated`
- `Quote`: `active` -> `expired` -> `replaced`
- `PTBArtifact`: `compiled` -> `invalidated`
- `ConfirmationGate`: `pending` -> `approved` -> `invalidated`

## Invalidation Rules
- Any post-preview change to assets or amount invalidates quote, guardian report, preview, and confirmation gate.
- Quote expiry invalidates preview and confirmation gate until a refreshed quote regenerates them.
- Unavailable or expired whitelist blocks new validations; in-progress flows continue only if they already passed validation before the whitelist version changed.

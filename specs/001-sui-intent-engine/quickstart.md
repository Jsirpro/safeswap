# Quickstart: SafeSwap Intent Engine on Sui

## Goal
Verify the guarded bilingual exact-input swap flow without allowing any direct wallet bypass.

## Prerequisites
- Node.js 20+
- npm 10+
- Optional for browser e2e: Playwright browser binaries installed with `npx playwright install`

## Setup
1. Run `npm install`.
2. Review `.env.example` and override values if needed.
3. Start the backend with `npm run dev --workspace backend`.
4. Start the frontend with `npm run dev --workspace frontend`.

## Happy Path Test
1. Open the web app at `http://localhost:3000`.
2. Enter either `Swap 10 SUI to USDC` or `把 10 SUI 换成 USDC`.
3. If the request is ambiguous, use the explicit intent-confirm button.
4. Verify the request passes whitelist validation before any quote is created.
5. Click `Get Quote`.
6. Click `Generate Preview`.
7. Verify the preview explains:
   - what leaves the wallet
   - what enters the wallet
   - expected output
   - minimum output
   - route summary
   - failure conditions
   - guardian findings
8. Click `Confirm And Unlock Wallet`.
9. Verify only then does `Request Wallet Signature` appear.

## Guardian Blocking Test
1. Use a mock quote fixture with critical slippage or price deviation.
2. Verify guardian severity becomes `critical`.
3. Verify preview creation is blocked.
4. Verify no wallet handoff is available.

## Quote Expiry And Refresh Test
1. Generate a quote and preview.
2. Refresh the quote.
3. Verify prior PTB, preview, and confirmation state are invalidated.
4. Verify a fresh preview is required before confirmation can happen again.

## Whitelist Failure Test
1. Disable the remote whitelist and clear any valid cache while `MOCK_MODE=false`.
2. Start a new swap flow.
3. Verify the app returns a localized whitelist-unavailable error before quote generation.

## Mock Mode Test
1. Set `MOCK_MODE=true`.
2. Repeat the happy-path flow.
3. Verify the backend returns permission plus wallet payload, not a live signature.
4. Verify the frontend mock signer only runs after explicit confirmation.

## SC-005 Bilingual Preview Comprehension Rubric
Use `frontend/tests/e2e/fixtures/preview-comprehension-checklist.json`. A run passes when at least 6 required items are understood correctly by the reviewer in both languages.

## Verification Notes
Validated on June 16, 2026 with:
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run test --workspace backend`
- `npm run test --workspace frontend`

Attempted on June 16, 2026 but blocked by environment:
- `npm run test:e2e --workspace frontend`
- Blocker: Playwright Chromium binary not installed in this environment

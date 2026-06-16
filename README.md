# SafeSwap Intent Engine on Sui

SafeSwap is an intent engine, not a swap bot. Users describe an exact-input swap goal in English or Chinese, the system validates the intent, fetches a quote, compiles a PTB, runs guardian checks, generates a human-readable preview, requires explicit confirmation, and only then unlocks wallet signing.

## Guarded Flow

`Intent -> Validate -> Quote -> PTB -> Guardian -> Preview -> Confirm -> Wallet`

Direct wallet access is intentionally not exposed. Guardian and confirmation are mandatory.

## Local Development

Requirements:
- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Run the backend:

```bash
npm run dev --workspace backend
```

Run the frontend:

```bash
npm run dev --workspace frontend
```

## Runtime Configuration

Copy values from `.env.example` as needed. Important variables:
- `MOCK_MODE`: when `true`, uses mock whitelist pairs and mock quote generation
- `REMOTE_WHITELIST_URL`: remote whitelist source used when mock mode is disabled
- `WHITELIST_CACHE_TTL_MS`: whitelist snapshot TTL; expired or unavailable whitelist blocks new flows
- `NEXT_PUBLIC_API_BASE_URL`: frontend API origin
- `SUI_RPC_URL`: reserved for Sui integration and signing handoff

## Verification

Backend and frontend unit/integration tests pass with:

```bash
npm run test --workspace backend
npm run test --workspace frontend
```

Playwright e2e specs are present in `frontend/tests/e2e/`, but this environment does not yet have Playwright browser binaries installed. Install them with `npx playwright install` before running `npm run test:e2e --workspace frontend`.

## Current Mock Pairs

- `SUI -> USDC`
- `USDC -> SUI`

## Bilingual Preview

Preview and validation copy default to the input language and can be switched manually between English and Chinese before confirmation.

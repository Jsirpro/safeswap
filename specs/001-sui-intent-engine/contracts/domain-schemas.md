# Domain Schemas

## Intent Confirmation Contract
- Trigger: parser marks `ambiguityStatus = needs_confirmation`
- Required UI behavior:
  - Show interpreted `SwapIntent` fields before validation continues.
  - Require an explicit confirm or edit action.
  - Editing the request returns the flow to parse state.

## Quote Freshness Contract
- A quote is confirmable only when:
  - The quote is still active.
  - The quote still matches the validated intent.
  - The guardian report was generated from the same active quote.
- On expiry:
  - Any preview generated from the quote becomes invalid.
  - Confirmation permission must be denied.
  - The user must obtain a refreshed quote.

## Whitelist Contract
- Supported asset pairs come from a remote config source.
- Server may use cached whitelist data only while unexpired.
- If no fresh remote data or unexpired cache exists, new flows must fail safe.
- A whitelist update affects only flows that start after the update is applied.

## Preview Disclosure Contract
Every preview must disclose all of the following in the selected language:
- Wallet outflow
- Wallet inflow
- Expected output
- Minimum output
- Route summary
- Failure conditions
- Guardian findings

## Confirmation Contract
- Confirmation is bound to a single preview snapshot.
- The wallet payload may be returned only after:
  - Validation success
  - Active quote
  - Non-blocking guardian result
  - Preview generation
  - Explicit confirmation
- Any intent edit, quote expiry, or invalidation event revokes confirmation eligibility.

## Mock Mode Contract
- Mock mode exercises the same parse -> validate -> quote -> guardian -> preview -> confirm sequence.
- Mock mode may not request a live wallet signature.
- Mock mode must still enforce whitelist, quote freshness, guardian blocking, and confirmation rules.

'use client';

export function IntentConfirmation({ intent, onConfirm }: { intent: any; onConfirm: () => void }) {
  if (!intent) return null;
  return (
    <section>
      <h3>Interpretation</h3>
      <p>{intent.inputAmount} {intent.inputAssetSymbol} → {intent.outputAssetSymbol}</p>
      <button type="button" onClick={onConfirm}>Confirm Intent</button>
    </section>
  );
}

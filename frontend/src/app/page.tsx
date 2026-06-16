'use client';

import { createQuote, createPreview, confirmPreview, refreshQuote } from '../services/intent-engine-client';
import { SwapStoreProvider, useSwapStore, initialState } from '../features/swap/store';
import { SwapForm } from '../features/swap/components/swap-form';
import { QuoteSummary } from '../features/swap/components/quote-summary';
import { GuardianFindings } from '../features/swap/components/guardian-findings';
import { PreviewCard } from '../features/swap/components/preview-card';
import { ConfirmationGate } from '../features/swap/components/confirmation-gate';
import { WalletHandoffButton } from '../features/swap/components/wallet-handoff-button';
import { SwapEditor } from '../features/swap/components/swap-editor';
import { useWalletHandoff } from '../features/swap/hooks/use-wallet-handoff';

function SwapExperience() {
  const { state, setState } = useSwapStore();
  const { handoff, signature } = useWalletHandoff();

  async function loadQuote() {
    if (!state.intent?.intentId) return;
    const result: any = await createQuote(state.intent.intentId);
    setState((current) => ({ ...current, quote: result.quote, guardian: result.guardian, error: null }));
  }

  async function loadPreview() {
    if (!state.intent?.intentId) return;
    const result: any = await createPreview(state.intent.intentId, state.outputLanguage);
    setState((current) => ({ ...current, preview: result.preview, error: null }));
  }

  async function confirm() {
    if (!state.intent?.intentId || !state.preview?.previewId) return;
    const result: any = await confirmPreview(state.intent.intentId, state.preview.previewId);
    setState((current) => ({ ...current, walletPayload: result.walletPayload, error: null }));
  }

  async function requestWallet() {
    if (!state.walletPayload) return;
    const next = await handoff(state.walletPayload);
    setState((current) => ({ ...current, error: next }));
  }

  async function refresh() {
    if (!state.intent?.intentId) return;
    const result: any = await refreshQuote(state.intent.intentId);
    setState((current) => ({ ...current, quote: result.quote, guardian: result.guardian, preview: null, walletPayload: null }));
  }

  function reset() {
    setState(initialState);
  }

  return (
    <main>
      <SwapForm />
      <QuoteSummary quote={state.quote} />
      <GuardianFindings guardian={state.guardian} />
      <PreviewCard preview={state.preview} />
      {state.intent?.intentId && !state.quote ? <button onClick={loadQuote}>Get Quote</button> : null}
      {state.quote && !state.preview ? <button onClick={loadPreview}>Generate Preview</button> : null}
      {state.preview && !state.walletPayload ? <ConfirmationGate language={state.outputLanguage} onConfirm={confirm} /> : null}
      {state.walletPayload ? <WalletHandoffButton language={state.outputLanguage} onClick={requestWallet} /> : null}
      {state.quote ? <button onClick={refresh}>Refresh Quote</button> : null}
      {state.preview ? <SwapEditor language={state.outputLanguage} onEdit={reset} /> : null}
      {signature ? <p>{signature}</p> : null}
    </main>
  );
}

export default function Page() {
  return (
    <SwapStoreProvider>
      <SwapExperience />
    </SwapStoreProvider>
  );
}

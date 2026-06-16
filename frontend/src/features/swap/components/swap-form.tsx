'use client';

import { useState } from 'react';
import { labels, type SupportedLanguage } from '../../../services/i18n';
import { parseIntent } from '../../../services/intent-engine-client';
import { useSwapStore, initialState } from '../store';
import { LanguageToggle } from './language-toggle';
import { IntentConfirmation } from './intent-confirmation';

export function SwapForm() {
  const { state, setState } = useSwapStore();
  const [sourceText, setSourceText] = useState(state.sourceText);
  const copy = labels[state.outputLanguage];

  async function onSubmit() {
    try {
      const result: any = await parseIntent({ sourceText, inputLanguage: state.inputLanguage, outputLanguage: state.outputLanguage });
      setState((current) => ({ ...current, sourceText, intent: result.intent, validation: result.validation, error: result.validation?.failureMessage ?? null }));
    } catch (error) {
      setState((current) => ({ ...current, error: (error as Error).message }));
    }
  }

  async function onConfirmInterpretation() {
    const result: any = await parseIntent({ sourceText, inputLanguage: state.inputLanguage, outputLanguage: state.outputLanguage, confirmInterpretation: true });
    setState((current) => ({ ...current, sourceText, intent: result.intent, validation: result.validation, error: result.validation?.failureMessage ?? null }));
  }

  function onLanguageChange(next: SupportedLanguage) {
    setState((current) => ({ ...current, outputLanguage: next, inputLanguage: current.sourceText ? current.inputLanguage : next }));
  }

  function onReset() {
    setState(initialState);
    setSourceText('');
  }

  return (
    <section>
      <h1>{copy.title}</h1>
      <p>{copy.subtitle}</p>
      <LanguageToggle value={state.outputLanguage} onChange={onLanguageChange} />
      <textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={4} />
      <div>
        <button type="button" onClick={onSubmit}>{copy.submit}</button>
        <button type="button" onClick={onReset}>{copy.edit}</button>
      </div>
      {state.error ? <p role="alert">{state.error}</p> : null}
      {state.intent?.ambiguityStatus === 'needs_confirmation' && state.intent?.inputAmount && state.intent?.inputAssetSymbol && state.intent?.outputAssetSymbol ? <IntentConfirmation intent={state.intent} onConfirm={onConfirmInterpretation} /> : null}
    </section>
  );
}

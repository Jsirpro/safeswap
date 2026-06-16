import { t } from '../../lib/i18n.js';
import type { SwapIntent } from '../intent/intent-model.js';
import type { ValidationResult } from './validation-model.js';
import type { WhitelistSnapshot } from '../../integrations/whitelist/whitelist-cache.js';

const unsupportedWords = ['bridge', 'lending', 'yield', 'perp', 'lp', 'autonomous'];

export function validateIntent(intent: SwapIntent, whitelist: WhitelistSnapshot): ValidationResult {
  const language = intent.outputLanguage;
  const failure = (failureCode: ValidationResult['failureCode'], failureMessage: string): ValidationResult => ({
    intentId: intent.intentId,
    isValid: false,
    failureCode,
    failureMessage,
    validatedPairId: null,
    whitelistVersion: whitelist.version,
    validatedAt: new Date().toISOString()
  });

  if (!intent.sourceText || unsupportedWords.some((word) => intent.sourceText.toLowerCase().includes(word))) {
    return failure('UNSUPPORTED_ACTION', t(language, 'unsupportedAction'));
  }

  if (!intent.inputAmount && !intent.inputAssetSymbol && !intent.outputAssetSymbol) {
    return failure('UNPARSEABLE_INTENT', t(language, 'parseFailed'));
  }

  if (!intent.inputAmount || Number(intent.inputAmount) <= 0) {
    return failure('INVALID_AMOUNT', t(language, 'amountRequired'));
  }

  if (intent.ambiguityStatus === 'needs_confirmation' && !intent.userConfirmedInterpretation) {
    return failure('AMBIGUITY_REQUIRES_CONFIRMATION', t(language, 'ambiguity'));
  }

  if (whitelist.status === 'unavailable' || Date.now() >= Date.parse(whitelist.expiresAt)) {
    return failure('WHITELIST_UNAVAILABLE', t(language, 'whitelistUnavailable'));
  }

  const pair = whitelist.supportedPairs.find(
    (entry) => entry.displayInputSymbol === intent.inputAssetSymbol && entry.displayOutputSymbol === intent.outputAssetSymbol && entry.enabled
  );

  if (!pair) {
    return failure('UNSUPPORTED_PAIR', t(language, 'unsupportedPair'));
  }

  return {
    intentId: intent.intentId,
    isValid: true,
    failureCode: null,
    failureMessage: null,
    validatedPairId: pair.pairId,
    whitelistVersion: whitelist.version,
    validatedAt: new Date().toISOString()
  };
}

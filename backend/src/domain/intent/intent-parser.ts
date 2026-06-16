import { randomUUID } from 'node:crypto';
import type { SupportedLanguage } from '../../lib/i18n.js';
import { detectLanguage } from '../../lib/i18n.js';
import type { SwapIntent } from './intent-model.js';

interface ParseIntentInput {
  sourceText: string;
  inputLanguage?: SupportedLanguage;
  outputLanguage?: SupportedLanguage;
  confirmInterpretation?: boolean;
}

export function parseIntent(input: ParseIntentInput): SwapIntent {
  const inputLanguage = input.inputLanguage ?? detectLanguage(input.sourceText);
  const outputLanguage = input.outputLanguage ?? inputLanguage;
  const normalized = input.sourceText.trim();

  const english = normalized.match(/^swap\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+to\s+([a-zA-Z]+)$/i);
  const chinese = normalized.match(/^(?:给我)?把\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s*换成\s*([a-zA-Z]+)$/i);
  const ambiguousEnglish = normalized.match(/^swap\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/i);
  const ambiguousChinese = normalized.match(/^(?:给我)?把\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s*换$/i);

  const match = english ?? chinese;
  const ambiguous = ambiguousEnglish ?? ambiguousChinese;

  if (match) {
    return buildIntent(match[1], match[2], match[3], inputLanguage, outputLanguage, input.confirmInterpretation ?? true, 'clear', normalized);
  }

  if (ambiguous) {
    return buildIntent(ambiguous[1], ambiguous[2], 'USDC', inputLanguage, outputLanguage, input.confirmInterpretation ?? false, 'needs_confirmation', normalized);
  }

  return buildIntent('', '', '', inputLanguage, outputLanguage, false, 'needs_confirmation', normalized);
}

function buildIntent(
  amount: string,
  inputAssetSymbol: string,
  outputAssetSymbol: string,
  inputLanguage: SupportedLanguage,
  outputLanguage: SupportedLanguage,
  confirmed: boolean,
  ambiguityStatus: 'clear' | 'needs_confirmation',
  sourceText: string
): SwapIntent {
  return {
    intentId: randomUUID(),
    sourceText,
    inputLanguage,
    outputLanguage,
    inputAssetSymbol: inputAssetSymbol.toUpperCase(),
    inputAssetType: inputAssetSymbol ? `mock::${inputAssetSymbol.toUpperCase()}` : '',
    outputAssetSymbol: outputAssetSymbol.toUpperCase(),
    outputAssetType: outputAssetSymbol ? `mock::${outputAssetSymbol.toUpperCase()}` : '',
    inputAmount: amount,
    swapMode: 'exact_input',
    ambiguityStatus,
    userConfirmedInterpretation: confirmed,
    status: 'parsed',
    createdAt: new Date().toISOString()
  };
}

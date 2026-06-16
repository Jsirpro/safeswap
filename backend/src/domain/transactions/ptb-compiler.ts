import { randomUUID } from 'node:crypto';
import type { SwapIntent } from '../intent/intent-model.js';
import type { Quote } from '../quotes/quote-model.js';
import type { PTBArtifact } from '../preview/preview-model.js';

export function compilePtb(intent: SwapIntent, quote: Quote): PTBArtifact {
  const serializedTransaction = JSON.stringify({
    intentId: intent.intentId,
    quoteId: quote.quoteId,
    inputAsset: intent.inputAssetSymbol,
    outputAsset: intent.outputAssetSymbol,
    inputAmount: intent.inputAmount,
    minimumOutputAmount: quote.minimumOutputAmount
  });

  return {
    ptbId: randomUUID(),
    intentId: intent.intentId,
    quoteId: quote.quoteId,
    serializedTransaction,
    routeSummary: quote.routeSummary,
    walletOutflow: [{ asset: intent.inputAssetSymbol, amount: intent.inputAmount }],
    walletInflow: [{ asset: intent.outputAssetSymbol, amount: quote.expectedOutputAmount }],
    status: 'compiled',
    compiledAt: new Date().toISOString()
  };
}

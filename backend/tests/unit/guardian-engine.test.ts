
import { describe, expect, it } from 'vitest';
import { evaluateGuardian } from '../../src/domain/guardian/guardian-engine.js';
import type { SwapIntent } from '../../src/domain/intent/intent-model.js';
import type { Quote } from '../../src/domain/quotes/quote-model.js';

const baseIntent: SwapIntent = {
  intentId: 'intent-1',
  sourceText: 'Swap 10 SUI to USDC',
  inputLanguage: 'en',
  outputLanguage: 'en',
  inputAssetSymbol: 'SUI',
  inputAssetType: 'mock::SUI',
  outputAssetSymbol: 'USDC',
  outputAssetType: 'mock::USDC',
  inputAmount: '10',
  swapMode: 'exact_input',
  ambiguityStatus: 'clear',
  userConfirmedInterpretation: true,
  status: 'validated',
  createdAt: new Date().toISOString()
};

const baseQuote: Quote = {
  quoteId: 'quote-1',
  intentId: 'intent-1',
  routeId: 'route-1',
  expectedOutputAmount: '11.2000',
  minimumOutputAmount: '11.0320',
  estimatedSlippageBps: 50,
  routeSummary: 'SUI -> USDC',
  providerTimestamp: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  status: 'active'
};

describe('guardian engine', () => {
  it('returns info severity for a healthy quote', () => {
    const report = evaluateGuardian(baseIntent, baseQuote);
    expect(report.overallSeverity).toBe('info');
    expect(report.canProceedToPreview).toBe(true);
  });

  it('maps slippage and price deviation into critical blocking findings', () => {
    const report = evaluateGuardian(baseIntent, {
      ...baseQuote,
      estimatedSlippageBps: 120,
      minimumOutputAmount: '9.0000'
    });

    expect(report.overallSeverity).toBe('critical');
    expect(report.findings.map((finding) => finding.category)).toEqual(expect.arrayContaining(['high_slippage', 'price_deviation']));
    expect(report.canProceedToPreview).toBe(false);
  });
});

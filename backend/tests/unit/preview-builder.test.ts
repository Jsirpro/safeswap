
import { describe, expect, it } from 'vitest';
import { buildPreview } from '../../src/domain/preview/preview-builder.js';
import type { GuardianReport } from '../../src/domain/guardian/guardian-model.js';
import type { SwapIntent } from '../../src/domain/intent/intent-model.js';
import type { PTBArtifact } from '../../src/domain/preview/preview-model.js';
import type { Quote } from '../../src/domain/quotes/quote-model.js';

const intent: SwapIntent = {
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

const quote: Quote = {
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

const ptb: PTBArtifact = {
  ptbId: 'ptb-1',
  intentId: 'intent-1',
  quoteId: 'quote-1',
  serializedTransaction: '{"intentId":"intent-1"}',
  routeSummary: 'SUI -> USDC',
  walletOutflow: [{ asset: 'SUI', amount: '10' }],
  walletInflow: [{ asset: 'USDC', amount: '11.2000' }],
  status: 'compiled',
  compiledAt: new Date().toISOString()
};

const guardian: GuardianReport = {
  intentId: 'intent-1',
  quoteId: 'quote-1',
  findings: [{
    findingId: 'finding-1',
    intentId: 'intent-1',
    severity: 'warning',
    category: 'stale_route',
    message: 'Route is aging.',
    blocking: false
  }],
  overallSeverity: 'warning',
  canProceedToPreview: true,
  evaluatedAt: new Date().toISOString()
};

describe('preview builder', () => {
  it('builds a complete English preview', () => {
    const preview = buildPreview(intent, quote, ptb, guardian, 'en');
    expect(preview.walletOutflowText).toContain('You will send 10 SUI');
    expect(preview.routeText).toContain('Route: SUI -> USDC');
    expect(preview.guardianFindingsText).toContain('Route is aging.');
  });

  it('builds localized Chinese preview copy', () => {
    const preview = buildPreview(intent, quote, ptb, guardian, 'zh');
    expect(preview.walletOutflowText).toContain('你将支付 10 SUI');
    expect(preview.minimumOutputText).toContain('最小输出');
  });
});

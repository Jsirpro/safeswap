import { randomUUID } from 'node:crypto';
import type { GuardianFinding, GuardianReport } from './guardian-model.js';
import type { Quote } from '../quotes/quote-model.js';
import type { SwapIntent } from '../intent/intent-model.js';

export function evaluateGuardian(intent: SwapIntent, quote: Quote): GuardianReport {
  const findings: GuardianFinding[] = [];
  const now = Date.now();
  const quoteAgeMs = now - Date.parse(quote.providerTimestamp);

  if (quote.estimatedSlippageBps >= 100) {
    findings.push(buildFinding(intent.intentId, 'high_slippage', 'critical', true, `Slippage is ${quote.estimatedSlippageBps} bps.`));
  }
  if (Number(quote.minimumOutputAmount) <= 0) {
    findings.push(buildFinding(intent.intentId, 'low_liquidity', 'critical', true, 'Available liquidity is too low for this swap.'));
  }
  if (quoteAgeMs > 45_000) {
    findings.push(buildFinding(intent.intentId, 'stale_route', 'critical', true, 'Quote or route data is stale.'));
  }
  if (Number(quote.minimumOutputAmount) / Number(quote.expectedOutputAmount || 1) < 0.97) {
    findings.push(buildFinding(intent.intentId, 'price_deviation', 'critical', true, 'Price deviation exceeds the allowed threshold.'));
  }

  const overallSeverity = findings.some((finding) => finding.severity === 'critical') ? 'critical' : findings.some((finding) => finding.severity === 'warning') ? 'warning' : 'info';

  return {
    intentId: intent.intentId,
    quoteId: quote.quoteId,
    findings,
    overallSeverity,
    canProceedToPreview: overallSeverity !== 'critical',
    evaluatedAt: new Date().toISOString()
  };
}

function buildFinding(intentId: string, category: GuardianFinding['category'], severity: GuardianFinding['severity'], blocking: boolean, message: string): GuardianFinding {
  return {
    findingId: randomUUID(),
    intentId,
    severity,
    category,
    message,
    blocking
  };
}

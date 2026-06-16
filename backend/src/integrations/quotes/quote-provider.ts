import { randomUUID } from 'node:crypto';
import { createMockQuote, type QuoteRequest } from './mock-quote-provider.js';
import type { Quote } from '../../domain/quotes/quote-model.js';

export class QuoteProvider {
  async createQuote(request: QuoteRequest): Promise<Quote> {
    const base = createMockQuote(request);
    const now = new Date();
    return {
      quoteId: randomUUID(),
      intentId: request.intentId,
      routeId: base.routeId,
      expectedOutputAmount: base.expectedOutputAmount,
      minimumOutputAmount: base.minimumOutputAmount,
      estimatedSlippageBps: base.estimatedSlippageBps,
      routeSummary: base.routeSummary,
      providerTimestamp: now.toISOString(),
      expiresAt: new Date(now.getTime() + 60_000).toISOString(),
      status: 'active'
    };
  }
}

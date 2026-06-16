import { invalidateIntentFlow } from '../../domain/flow/intent-invalidation.js';
import type { FlowSessionStore } from '../../lib/flow-session-store.js';
import type { QuoteService } from '../../domain/quotes/quote-service.js';
import { handleCreateQuote } from './create-quote.js';

export async function handleRefreshQuote(store: FlowSessionStore, quoteService: QuoteService, intentId: string) {
  invalidateIntentFlow(store, intentId);
  return handleCreateQuote(store, quoteService, intentId);
}

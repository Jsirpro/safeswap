import type { QuoteService } from '../../domain/quotes/quote-service.js';
import { evaluateGuardian } from '../../domain/guardian/guardian-engine.js';
import type { FlowSessionStore } from '../../lib/flow-session-store.js';

export async function handleCreateQuote(store: FlowSessionStore, quoteService: QuoteService, intentId: string) {
  const quote = await quoteService.createQuote(intentId);
  const session = store.get(intentId);
  const guardian = evaluateGuardian(session.intent, quote);
  store.patch(intentId, { guardian });
  return { intentId, quote, guardian };
}

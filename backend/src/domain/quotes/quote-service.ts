import type { FlowSessionStore } from '../../lib/flow-session-store.js';
import type { Quote } from './quote-model.js';
import { QuoteProvider } from '../../integrations/quotes/quote-provider.js';

export class QuoteService {
  constructor(
    private readonly store: FlowSessionStore,
    private readonly provider: QuoteProvider
  ) {}

  async createQuote(intentId: string): Promise<Quote> {
    const session = this.store.get(intentId);
    if (!session.validation?.isValid) throw new Error('INTENT_NOT_VALIDATED');

    const quote = await this.provider.createQuote({
      intentId,
      inputAssetSymbol: session.intent.inputAssetSymbol,
      outputAssetSymbol: session.intent.outputAssetSymbol,
      inputAmount: session.intent.inputAmount
    });
    this.store.patch(intentId, { quote });
    return quote;
  }
}

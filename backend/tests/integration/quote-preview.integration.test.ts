
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../src/api/router.js';
import { QuoteProvider } from '../../src/integrations/quotes/quote-provider.js';

describe('quote, guardian, and preview integration', () => {
  const previousMock = process.env.MOCK_MODE;
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    process.env.MOCK_MODE = 'true';
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
    process.env.MOCK_MODE = previousMock;
  });

  it('creates a quote, renders preview copy, and refreshes expired downstream state', async () => {
    const parseResponse = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
    const intentId = parseResponse.body.intent.intentId as string;

    const quoteResponse = await request(app.server).post(`/api/intents/${intentId}/quote`).send({});
    const previewResponse = await request(app.server).post(`/api/intents/${intentId}/preview`).send({ language: 'en' });
    const refreshResponse = await request(app.server).post(`/api/intents/${intentId}/refresh`).send({});

    expect(quoteResponse.body.guardian.overallSeverity).toBe('info');
    expect(previewResponse.body.preview.failureConditionsText).toContain('quote expires');
    expect(refreshResponse.body.quote.quoteId).not.toBe(quoteResponse.body.quote.quoteId);
  });

  it('blocks preview generation when guardian returns critical findings', async () => {
    vi.spyOn(QuoteProvider.prototype, 'createQuote').mockResolvedValue({
      quoteId: 'quote-critical',
      intentId: 'intent-critical',
      routeId: 'route-critical',
      expectedOutputAmount: '10',
      minimumOutputAmount: '8',
      estimatedSlippageBps: 150,
      routeSummary: 'SUI -> USDC',
      providerTimestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      status: 'active'
    });

    const parseResponse = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
    const intentId = parseResponse.body.intent.intentId as string;

    const quoteResponse = await request(app.server).post(`/api/intents/${intentId}/quote`).send({});
    const previewResponse = await request(app.server).post(`/api/intents/${intentId}/preview`).send({ language: 'en' });

    expect(quoteResponse.body.guardian.overallSeverity).toBe('critical');
    expect(previewResponse.status).toBe(409);
    expect(previewResponse.body.code).toBe('GUARDIAN_BLOCKED');
  });
});

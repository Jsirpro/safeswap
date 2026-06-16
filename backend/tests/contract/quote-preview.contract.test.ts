
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';

async function createIntent(app: ReturnType<typeof buildApp>) {
  const response = await request(app.server)
    .post('/api/intents/parse')
    .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
  return response.body.intent.intentId as string;
}

describe('quote and preview contracts', () => {
  const previousMock = process.env.MOCK_MODE;
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    process.env.MOCK_MODE = 'true';
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    process.env.MOCK_MODE = previousMock;
  });

  it('returns quote and guardian payloads for a validated intent', async () => {
    const intentId = await createIntent(app);
    const response = await request(app.server).post(`/api/intents/${intentId}/quote`).send({});

    expect(response.status).toBe(200);
    expect(response.body.quote).toMatchObject({
      intentId,
      status: 'active',
      routeSummary: 'SUI -> USDC'
    });
    expect(response.body.guardian).toMatchObject({
      intentId,
      overallSeverity: 'info',
      canProceedToPreview: true
    });
  });

  it('returns a human-readable preview and refreshes quotes after invalidation', async () => {
    const intentId = await createIntent(app);
    await request(app.server).post(`/api/intents/${intentId}/quote`).send({});

    const previewResponse = await request(app.server)
      .post(`/api/intents/${intentId}/preview`)
      .send({ language: 'zh' });

    expect(previewResponse.status).toBe(200);
    expect(previewResponse.body.preview).toMatchObject({
      intentId,
      language: 'zh'
    });
    expect(previewResponse.body.preview.walletOutflowText).toContain('你将支付');

    const refreshResponse = await request(app.server).post(`/api/intents/${intentId}/refresh`).send({});
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.quote.status).toBe('active');
  });
});

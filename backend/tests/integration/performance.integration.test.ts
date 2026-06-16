
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';

describe('performance regression budget', () => {
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

  it('keeps parse, quote, preview, and confirmation within local mock latency budgets', async () => {
    const parseStart = performance.now();
    const parseResponse = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
    const parseMs = performance.now() - parseStart;
    const intentId = parseResponse.body.intent.intentId as string;

    const quoteStart = performance.now();
    await request(app.server).post(`/api/intents/${intentId}/quote`).send({});
    const quoteMs = performance.now() - quoteStart;

    const previewStart = performance.now();
    const previewResponse = await request(app.server).post(`/api/intents/${intentId}/preview`).send({ language: 'en' });
    const previewMs = performance.now() - previewStart;

    const confirmStart = performance.now();
    await request(app.server)
      .post(`/api/intents/${intentId}/confirm`)
      .send({ previewId: previewResponse.body.preview.previewId, confirmed: true });
    const confirmMs = performance.now() - confirmStart;

    expect(parseMs).toBeLessThan(250);
    expect(quoteMs).toBeLessThan(250);
    expect(previewMs).toBeLessThan(250);
    expect(confirmMs).toBeLessThan(250);
  });
});

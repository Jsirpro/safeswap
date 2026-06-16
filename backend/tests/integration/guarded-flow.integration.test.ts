
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';

describe('guarded wallet flow', () => {
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

  it('does not expose a direct wallet route and blocks confirmation before preview', async () => {
    const missingWalletRoute = await request(app.server).post('/api/wallet/sign').send({});
    expect(missingWalletRoute.status).toBe(404);

    const parseResponse = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
    const intentId = parseResponse.body.intent.intentId as string;

    const confirmResponse = await request(app.server)
      .post(`/api/intents/${intentId}/confirm`)
      .send({ previewId: 'missing-preview', confirmed: true });

    expect(confirmResponse.status).toBe(400);
    expect(confirmResponse.body.code).toBe('QUOTE_NOT_ACTIVE');
  });
});

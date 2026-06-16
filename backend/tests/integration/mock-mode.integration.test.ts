
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';

describe('mock mode integration', () => {
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

  it('uses mock whitelist and returns backend permission instead of a live signature request', async () => {
    const parseResponse = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 USDC to SUI', inputLanguage: 'en', outputLanguage: 'en' });
    const intentId = parseResponse.body.intent.intentId as string;
    expect(parseResponse.body.validation.isValid).toBe(true);

    await request(app.server).post(`/api/intents/${intentId}/quote`).send({});
    const previewResponse = await request(app.server).post(`/api/intents/${intentId}/preview`).send({ language: 'en' });
    const confirmResponse = await request(app.server)
      .post(`/api/intents/${intentId}/confirm`)
      .send({ previewId: previewResponse.body.preview.previewId, confirmed: true });

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.walletPayload.serializedTransaction).toContain('minimumOutputAmount');
    expect(confirmResponse.body.walletPayload).not.toHaveProperty('signature');
  });
});


import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';
import parseIntentRequest from './fixtures/parse-intent.request.json';

describe('POST /api/intents/parse contract', () => {
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

  it('returns a validated intent response for a supported request', async () => {
    const response = await request(app.server).post('/api/intents/parse').send(parseIntentRequest);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'validated',
      ambiguityStatus: 'clear',
      intent: {
        sourceText: 'Swap 10 SUI to USDC',
        inputAssetSymbol: 'SUI',
        outputAssetSymbol: 'USDC'
      },
      validation: {
        isValid: true,
        validatedPairId: 'SUI-USDC'
      }
    });
  });

  it('returns a localized validation failure for an unsupported request', async () => {
    const response = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to BTC', inputLanguage: 'en', outputLanguage: 'en' });

    expect(response.status).toBe(200);
    expect(response.body.validation).toMatchObject({
      isValid: false,
      failureCode: 'UNSUPPORTED_PAIR'
    });
    expect(response.body.validation.failureMessage).toContain('not supported');
  });
});

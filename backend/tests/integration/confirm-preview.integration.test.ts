
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';

async function buildConfirmedFlow(app: ReturnType<typeof buildApp>) {
  const parseResponse = await request(app.server)
    .post('/api/intents/parse')
    .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
  const intentId = parseResponse.body.intent.intentId as string;
  await request(app.server).post(`/api/intents/${intentId}/quote`).send({});
  const previewResponse = await request(app.server).post(`/api/intents/${intentId}/preview`).send({ language: 'en' });
  return { intentId, previewId: previewResponse.body.preview.previewId as string };
}

describe('confirmation integration', () => {
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

  it('grants wallet handoff only after explicit confirmation', async () => {
    const { intentId, previewId } = await buildConfirmedFlow(app);
    const response = await request(app.server).post(`/api/intents/${intentId}/confirm`).send({ previewId, confirmed: true });

    expect(response.status).toBe(200);
    expect(response.body.permissionGranted).toBe(true);
    expect(response.body.walletPayload.previewId).toBe(previewId);
  });

  it('revokes prior confirmation after a post-preview refresh', async () => {
    const { intentId, previewId } = await buildConfirmedFlow(app);
    const firstConfirm = await request(app.server).post(`/api/intents/${intentId}/confirm`).send({ previewId, confirmed: true });
    expect(firstConfirm.status).toBe(200);

    await request(app.server).post(`/api/intents/${intentId}/refresh`).send({});

    const staleConfirm = await request(app.server).post(`/api/intents/${intentId}/confirm`).send({ previewId, confirmed: true });
    expect(staleConfirm.status).toBe(409);
    expect(staleConfirm.body.code).toBe('PREVIEW_NOT_FOUND');
  });
});

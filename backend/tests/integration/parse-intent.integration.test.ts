
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/api/router.js';

describe('parse intent integration', () => {
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

  it('parses English and Chinese exact-input intents', async () => {
    const english = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
    const chinese = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: '把 10 SUI 换成 USDC', inputLanguage: 'zh', outputLanguage: 'zh' });

    expect(english.body.validation.isValid).toBe(true);
    expect(chinese.body.validation.isValid).toBe(true);
    expect(chinese.body.intent.outputLanguage).toBe('zh');
  });


  it('parses compact Chinese phrasing with a polite prefix', async () => {
    const response = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: '给我把9USDC换成sui', inputLanguage: 'zh', outputLanguage: 'zh' });

    expect(response.body.validation.isValid).toBe(true);
    expect(response.body.intent).toMatchObject({
      inputAmount: '9',
      inputAssetSymbol: 'USDC',
      outputAssetSymbol: 'SUI'
    });
  });

  it('returns a parse failure instead of an amount failure for unrecognized input', async () => {
    const response = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: '随便帮我搞一下', inputLanguage: 'zh', outputLanguage: 'zh' });

    expect(response.body.validation).toMatchObject({
      isValid: false,
      failureCode: 'UNPARSEABLE_INTENT'
    });
  });

  it('requires explicit confirmation for ambiguous intent interpretation', async () => {
    const firstPass = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI', inputLanguage: 'en', outputLanguage: 'en' });
    const confirmed = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI', inputLanguage: 'en', outputLanguage: 'en', confirmInterpretation: true });

    expect(firstPass.body.intent.ambiguityStatus).toBe('needs_confirmation');
    expect(firstPass.body.validation.failureCode).toBe('AMBIGUITY_REQUIRES_CONFIRMATION');
    expect(confirmed.body.validation.isValid).toBe(true);
    expect(confirmed.body.intent.outputAssetSymbol).toBe('USDC');
  });

  it('rejects unsupported pairs when the whitelist does not contain them', async () => {
    const response = await request(app.server)
      .post('/api/intents/parse')
      .send({ sourceText: 'Swap 10 SUI to CETUS', inputLanguage: 'en', outputLanguage: 'en' });

    expect(response.body.validation).toMatchObject({
      isValid: false,
      failureCode: 'UNSUPPORTED_PAIR'
    });
  });
});


import { describe, expect, it } from 'vitest';
import { parseIntent } from '../../src/domain/intent/intent-parser.js';
import { validateIntent } from '../../src/domain/validation/intent-validator.js';
import type { WhitelistSnapshot } from '../../src/integrations/whitelist/whitelist-cache.js';

const unavailableWhitelist: WhitelistSnapshot = {
  version: 'unavailable-1',
  source: 'https://example.com/whitelist',
  fetchedAt: new Date().toISOString(),
  expiresAt: new Date(0).toISOString(),
  status: 'unavailable',
  supportedPairs: []
};

describe('whitelist validation', () => {
  it('fails closed when whitelist data is unavailable', () => {
    const intent = parseIntent({ sourceText: 'Swap 10 SUI to USDC', inputLanguage: 'en', outputLanguage: 'en' });
    const result = validateIntent(intent, unavailableWhitelist);

    expect(result.isValid).toBe(false);
    expect(result.failureCode).toBe('WHITELIST_UNAVAILABLE');
  });

  it('requires ambiguity confirmation before allowing a defaulted pair', () => {
    const whitelist: WhitelistSnapshot = {
      version: 'v1',
      source: 'mock',
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      status: 'fresh',
      supportedPairs: [{
        pairId: 'SUI-USDC',
        inputAssetType: 'mock::SUI',
        outputAssetType: 'mock::USDC',
        displayInputSymbol: 'SUI',
        displayOutputSymbol: 'USDC',
        enabled: true
      }]
    };

    const intent = parseIntent({ sourceText: 'Swap 10 SUI', inputLanguage: 'en', outputLanguage: 'en' });
    const result = validateIntent(intent, whitelist);

    expect(result.isValid).toBe(false);
    expect(result.failureCode).toBe('AMBIGUITY_REQUIRES_CONFIRMATION');
  });
});

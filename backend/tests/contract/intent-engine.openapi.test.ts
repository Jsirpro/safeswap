
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('intent engine OpenAPI contract', () => {
  it('documents the guarded intent flow and omits direct wallet access', () => {
    const document = readFileSync(new URL('../../../specs/001-sui-intent-engine/contracts/intent-engine.openapi.yaml', import.meta.url), 'utf8');

    expect(document).toContain('/api/intents/parse');
    expect(document).toContain('/api/intents/{intentId}/quote');
    expect(document).toContain('/api/intents/{intentId}/preview');
    expect(document).toContain('/api/intents/{intentId}/refresh');
    expect(document).toContain('/api/intents/{intentId}/confirm');
    expect(document).not.toContain('/wallet');
    expect(document).not.toContain('Auto Sign');
  });
});

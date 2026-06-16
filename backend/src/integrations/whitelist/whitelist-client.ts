import { randomUUID } from 'node:crypto';
import { config } from '../../lib/config.js';
import { isMockMode } from '../../lib/mock-mode.js';
import { WhitelistCache, type SupportedPair, type WhitelistSnapshot } from './whitelist-cache.js';

const mockPairs: SupportedPair[] = [
  {
    pairId: 'SUI-USDC',
    inputAssetType: '0x2::sui::SUI',
    outputAssetType: '0x5d4b30...::coin::USDC',
    displayInputSymbol: 'SUI',
    displayOutputSymbol: 'USDC',
    enabled: true
  },
  {
    pairId: 'USDC-SUI',
    inputAssetType: '0x5d4b30...::coin::USDC',
    outputAssetType: '0x2::sui::SUI',
    displayInputSymbol: 'USDC',
    displayOutputSymbol: 'SUI',
    enabled: true
  }
];

export class WhitelistClient {
  constructor(private readonly cache: WhitelistCache) {}

  async getSnapshot(): Promise<WhitelistSnapshot> {
    const cached = this.cache.get();
    if (cached && !this.cache.isExpired()) {
      return { ...cached, status: 'cached' };
    }

    try {
      if (isMockMode()) {
        const snapshot = this.createSnapshot(mockPairs);
        this.cache.set(snapshot);
        return snapshot;
      }

      const response = await fetch(config.whitelistUrl);
      if (!response.ok) throw new Error(`Whitelist request failed: ${response.status}`);
      const payload = (await response.json()) as { supportedPairs: SupportedPair[]; version?: string };
      const snapshot = this.createSnapshot(payload.supportedPairs, payload.version);
      this.cache.set(snapshot);
      return snapshot;
    } catch {
      if (cached && !this.cache.isExpired()) return { ...cached, status: 'cached' };
      return {
        version: `unavailable-${randomUUID()}`,
        source: config.whitelistUrl,
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date(0).toISOString(),
        status: 'unavailable',
        supportedPairs: []
      };
    }
  }

  private createSnapshot(supportedPairs: SupportedPair[], version?: string): WhitelistSnapshot {
    const fetchedAt = new Date();
    return {
      version: version ?? randomUUID(),
      source: config.whitelistUrl,
      fetchedAt: fetchedAt.toISOString(),
      expiresAt: new Date(fetchedAt.getTime() + config.whitelistCacheTtlMs).toISOString(),
      status: 'fresh',
      supportedPairs
    };
  }
}

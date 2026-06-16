export interface SupportedPair {
  pairId: string;
  inputAssetType: string;
  outputAssetType: string;
  displayInputSymbol: string;
  displayOutputSymbol: string;
  enabled: boolean;
}

export interface WhitelistSnapshot {
  version: string;
  source: string;
  fetchedAt: string;
  expiresAt: string;
  status: 'fresh' | 'cached' | 'expired' | 'unavailable';
  supportedPairs: SupportedPair[];
}

export class WhitelistCache {
  private snapshot: WhitelistSnapshot | null = null;

  set(snapshot: WhitelistSnapshot): void {
    this.snapshot = snapshot;
  }

  get(): WhitelistSnapshot | null {
    return this.snapshot;
  }

  isExpired(now = Date.now()): boolean {
    if (!this.snapshot) return true;
    return now >= Date.parse(this.snapshot.expiresAt);
  }
}

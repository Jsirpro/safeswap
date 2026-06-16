export const config = {
  port: Number(process.env.SAFE_SWAP_PORT ?? 4000),
  whitelistUrl: process.env.REMOTE_WHITELIST_URL ?? 'http://localhost:4010/whitelist',
  whitelistCacheTtlMs: Number(process.env.WHITELIST_CACHE_TTL_MS ?? 300000),
  quoteProviderMode: process.env.QUOTE_PROVIDER_MODE ?? 'mock',
  suiRpcUrl: process.env.SUI_RPC_URL ?? 'https://fullnode.mainnet.sui.io',
  mockMode: (process.env.MOCK_MODE ?? 'true') === 'true'
};

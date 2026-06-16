export interface QuoteRequest {
  intentId: string;
  inputAssetSymbol: string;
  outputAssetSymbol: string;
  inputAmount: string;
}

const rates: Record<string, number> = {
  'SUI-USDC': 1.12,
  'USDC-SUI': 0.89
};

export function createMockQuote(request: QuoteRequest) {
  const key = `${request.inputAssetSymbol}-${request.outputAssetSymbol}`;
  const rate = rates[key] ?? 1;
  const input = Number(request.inputAmount);
  const expected = (input * rate).toFixed(4);
  const min = (Number(expected) * 0.985).toFixed(4);
  return {
    routeId: `route-${key}`,
    expectedOutputAmount: expected,
    minimumOutputAmount: min,
    estimatedSlippageBps: key === 'SUI-USDC' ? 50 : 80,
    routeSummary: `${request.inputAssetSymbol} -> ${request.outputAssetSymbol}`
  };
}

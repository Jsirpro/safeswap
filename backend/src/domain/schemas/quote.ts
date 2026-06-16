import { z } from 'zod';

export const quoteStatusSchema = z.enum(['active', 'expired', 'replaced']);

export const quoteSchema = z.object({
  quoteId: z.string(),
  intentId: z.string(),
  routeId: z.string(),
  expectedOutputAmount: z.string(),
  minimumOutputAmount: z.string(),
  estimatedSlippageBps: z.number().int().nonnegative(),
  routeSummary: z.string(),
  providerTimestamp: z.string(),
  expiresAt: z.string(),
  status: quoteStatusSchema
});

export type QuoteDto = z.infer<typeof quoteSchema>;

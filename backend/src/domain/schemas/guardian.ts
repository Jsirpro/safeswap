import { z } from 'zod';

export const guardianSeveritySchema = z.enum(['info', 'warning', 'critical']);

export const guardianFindingSchema = z.object({
  findingId: z.string(),
  intentId: z.string(),
  severity: guardianSeveritySchema,
  category: z.enum(['high_slippage', 'low_liquidity', 'stale_route', 'price_deviation', 'other']),
  message: z.string(),
  blocking: z.boolean()
});

export const guardianReportSchema = z.object({
  intentId: z.string(),
  quoteId: z.string(),
  findings: z.array(guardianFindingSchema),
  overallSeverity: guardianSeveritySchema,
  canProceedToPreview: z.boolean(),
  evaluatedAt: z.string()
});

export type GuardianFindingDto = z.infer<typeof guardianFindingSchema>;
export type GuardianReportDto = z.infer<typeof guardianReportSchema>;

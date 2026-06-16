import { z } from 'zod';
import { languageSchema } from './intent.js';

export const previewSchema = z.object({
  previewId: z.string(),
  intentId: z.string(),
  quoteId: z.string(),
  language: languageSchema,
  walletOutflowText: z.string(),
  walletInflowText: z.string(),
  expectedOutputText: z.string(),
  minimumOutputText: z.string(),
  routeText: z.string(),
  failureConditionsText: z.string(),
  guardianFindingsText: z.array(z.string()),
  generatedAt: z.string()
});

export const confirmationGateSchema = z.object({
  intentId: z.string(),
  previewId: z.string(),
  userConfirmed: z.boolean(),
  confirmedAt: z.string().nullable(),
  status: z.enum(['pending', 'approved', 'invalidated'])
});

export type PreviewDto = z.infer<typeof previewSchema>;
export type ConfirmationGateDto = z.infer<typeof confirmationGateSchema>;

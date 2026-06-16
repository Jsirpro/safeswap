import { z } from 'zod';

export const languageSchema = z.enum(['en', 'zh']);
export const ambiguityStatusSchema = z.enum(['clear', 'needs_confirmation']);
export const intentStatusSchema = z.enum(['parsed', 'validated', 'invalidated']);

export const swapIntentSchema = z.object({
  intentId: z.string(),
  sourceText: z.string().min(1),
  inputLanguage: languageSchema,
  outputLanguage: languageSchema,
  inputAssetSymbol: z.string().min(1),
  inputAssetType: z.string().min(1),
  outputAssetSymbol: z.string().min(1),
  outputAssetType: z.string().min(1),
  inputAmount: z.string().min(1),
  swapMode: z.literal('exact_input'),
  ambiguityStatus: ambiguityStatusSchema,
  userConfirmedInterpretation: z.boolean(),
  status: intentStatusSchema,
  createdAt: z.string()
});

export type SwapIntentDto = z.infer<typeof swapIntentSchema>;

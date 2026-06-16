import type { PreviewDto } from '../schemas/preview.js';

export type HumanReadablePreview = PreviewDto;

export interface PTBArtifact {
  ptbId: string;
  intentId: string;
  quoteId: string;
  serializedTransaction: string;
  routeSummary: string;
  walletOutflow: Array<{ asset: string; amount: string }>;
  walletInflow: Array<{ asset: string; amount: string }>;
  status: 'compiled' | 'invalidated';
  compiledAt: string;
}

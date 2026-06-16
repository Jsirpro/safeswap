import type { PTBArtifact } from '../preview/preview-model.js';

export function createWalletPayload(ptb: PTBArtifact, previewId: string) {
  return {
    intentId: ptb.intentId,
    previewId,
    ptbId: ptb.ptbId,
    serializedTransaction: ptb.serializedTransaction
  };
}

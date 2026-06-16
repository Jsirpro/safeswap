import type { ConfirmationService } from '../../domain/confirmation/confirmation-service.js';
import type { FlowSessionStore } from '../../lib/flow-session-store.js';
import { createWalletPayload } from '../../domain/transactions/wallet-handoff.js';

export function handleConfirmPreview(store: FlowSessionStore, confirmationService: ConfirmationService, intentId: string, previewId: string) {
  const result = confirmationService.confirm(intentId, previewId);
  const session = store.get(intentId);
  if (!session.ptb) throw new Error('PTB_NOT_FOUND');
  return {
    intentId,
    permissionGranted: result.permission.permissionGranted,
    walletPayload: createWalletPayload(session.ptb, previewId)
  };
}

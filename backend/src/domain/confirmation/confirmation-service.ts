import type { FlowSessionStore } from '../../lib/flow-session-store.js';
import { ensureQuoteIsActive } from '../flow/flow-state-machine.js';
import type { ConfirmationGate, ExecutionPermission } from './confirmation-model.js';

export class ConfirmationService {
  constructor(private readonly store: FlowSessionStore) {}

  confirm(intentId: string, previewId: string): { gate: ConfirmationGate; permission: ExecutionPermission } {
    const session = this.store.get(intentId);
    ensureQuoteIsActive(session);
    if (!session.guardian || session.guardian.overallSeverity === 'critical') throw new Error('GUARDIAN_BLOCKED');
    const preview = Object.values(session.previews).find((item) => item.previewId === previewId);
    if (!preview) throw new Error('PREVIEW_NOT_FOUND');
    if (!session.ptb) throw new Error('PTB_NOT_FOUND');

    const gate: ConfirmationGate = {
      intentId,
      previewId,
      userConfirmed: true,
      confirmedAt: new Date().toISOString(),
      status: 'approved'
    };

    this.store.patch(intentId, { confirmation: gate });
    return {
      gate,
      permission: {
        intentId,
        previewId,
        permissionGranted: true,
        ptbId: session.ptb.ptbId
      }
    };
  }
}

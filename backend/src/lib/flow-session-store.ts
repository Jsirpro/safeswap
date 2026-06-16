import type { ConfirmationGate } from '../domain/confirmation/confirmation-model.js';
import type { GuardianReport } from '../domain/guardian/guardian-model.js';
import type { SwapIntent } from '../domain/intent/intent-model.js';
import type { HumanReadablePreview, PTBArtifact } from '../domain/preview/preview-model.js';
import type { Quote } from '../domain/quotes/quote-model.js';
import type { ValidationResult } from '../domain/validation/validation-model.js';

export interface FlowSession {
  intent: SwapIntent;
  validation?: ValidationResult;
  quote?: Quote;
  guardian?: GuardianReport;
  ptb?: PTBArtifact;
  previews: Record<string, HumanReadablePreview>;
  confirmation?: ConfirmationGate;
}

export class FlowSessionStore {
  private readonly sessions = new Map<string, FlowSession>();

  upsertIntent(intent: SwapIntent): FlowSession {
    const next: FlowSession = {
      intent,
      previews: this.sessions.get(intent.intentId)?.previews ?? {}
    };
    this.sessions.set(intent.intentId, { ...this.sessions.get(intent.intentId), ...next });
    return this.get(intent.intentId);
  }

  get(intentId: string): FlowSession {
    const session = this.sessions.get(intentId);
    if (!session) throw new Error(`Unknown intent: ${intentId}`);
    return session;
  }

  patch(intentId: string, patch: Partial<FlowSession>): FlowSession {
    const current = this.get(intentId);
    const next = { ...current, ...patch, previews: patch.previews ?? current.previews };
    this.sessions.set(intentId, next);
    return next;
  }
}

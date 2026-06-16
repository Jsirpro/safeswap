import { buildPreview } from '../../domain/preview/preview-builder.js';
import { compilePtb } from '../../domain/transactions/ptb-compiler.js';
import { ensureQuoteIsActive } from '../../domain/flow/flow-state-machine.js';
import type { FlowSessionStore } from '../../lib/flow-session-store.js';

export function handleCreatePreview(store: FlowSessionStore, intentId: string, language: 'en' | 'zh') {
  const session = store.get(intentId);
  ensureQuoteIsActive(session);
  if (!session.quote) throw new Error('QUOTE_NOT_FOUND');
  if (!session.guardian) throw new Error('GUARDIAN_NOT_FOUND');
  if (session.guardian.overallSeverity === 'critical') throw new Error('GUARDIAN_BLOCKED');

  const ptb = compilePtb(session.intent, session.quote);
  const preview = buildPreview(session.intent, session.quote, ptb, session.guardian, language);
  store.patch(intentId, {
    ptb,
    previews: { ...session.previews, [language]: preview }
  });

  return {
    intentId,
    preview,
    quoteExpiresAt: session.quote.expiresAt,
    canConfirm: true
  };
}

import type { FlowSession } from '../../lib/flow-session-store.js';

export function ensureQuoteIsActive(session: FlowSession): void {
  if (!session.quote || session.quote.status !== 'active') {
    throw new Error('QUOTE_NOT_ACTIVE');
  }
  if (Date.now() >= Date.parse(session.quote.expiresAt)) {
    throw new Error('QUOTE_EXPIRED');
  }
}

export function invalidateDependentState(session: FlowSession): FlowSession {
  return {
    ...session,
    quote: session.quote ? { ...session.quote, status: 'expired' } : undefined,
    ptb: undefined,
    previews: {},
    confirmation: session.confirmation
      ? { ...session.confirmation, status: 'invalidated', userConfirmed: false, confirmedAt: null }
      : undefined
  };
}

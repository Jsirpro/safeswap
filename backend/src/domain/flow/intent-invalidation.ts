import type { FlowSessionStore } from '../../lib/flow-session-store.js';
import { invalidateDependentState } from './flow-state-machine.js';

export function invalidateIntentFlow(store: FlowSessionStore, intentId: string): void {
  const session = store.get(intentId);
  store.patch(intentId, invalidateDependentState(session));
}

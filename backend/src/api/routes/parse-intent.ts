import { parseIntent } from '../../domain/intent/intent-parser.js';
import { validateIntent } from '../../domain/validation/intent-validator.js';
import type { FlowSessionStore } from '../../lib/flow-session-store.js';
import type { WhitelistClient } from '../../integrations/whitelist/whitelist-client.js';

export async function handleParseIntent(store: FlowSessionStore, whitelistClient: WhitelistClient, body: Record<string, unknown>) {
  const intent = parseIntent({
    sourceText: String(body.sourceText ?? ''),
    inputLanguage: body.inputLanguage === 'zh' ? 'zh' : body.inputLanguage === 'en' ? 'en' : undefined,
    outputLanguage: body.outputLanguage === 'zh' ? 'zh' : body.outputLanguage === 'en' ? 'en' : undefined,
    confirmInterpretation: body.confirmInterpretation === true
  });
  store.upsertIntent(intent);

  const whitelist = await whitelistClient.getSnapshot();
  const validation = validateIntent(intent, whitelist);
  if (validation.isValid) {
    intent.status = 'validated';
    store.patch(intent.intentId, { intent, validation });
  } else {
    store.patch(intent.intentId, { validation });
  }

  return {
    intentId: intent.intentId,
    status: intent.status,
    ambiguityStatus: intent.ambiguityStatus,
    intent,
    validation
  };
}

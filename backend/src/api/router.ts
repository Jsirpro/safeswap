import Fastify from 'fastify';
import cors from '@fastify/cors';
import { FlowSessionStore } from '../lib/flow-session-store.js';
import { WhitelistCache } from '../integrations/whitelist/whitelist-cache.js';
import { WhitelistClient } from '../integrations/whitelist/whitelist-client.js';
import { QuoteProvider } from '../integrations/quotes/quote-provider.js';
import { QuoteService } from '../domain/quotes/quote-service.js';
import { ConfirmationService } from '../domain/confirmation/confirmation-service.js';
import { handleParseIntent } from './routes/parse-intent.js';
import { handleCreateQuote } from './routes/create-quote.js';
import { handleCreatePreview } from './routes/create-preview.js';
import { handleRefreshQuote } from './routes/refresh-quote.js';
import { handleConfirmPreview } from './routes/confirm-preview.js';
import { HttpError } from './http-error.js';

export function buildApp() {
  const app = Fastify();
  const store = new FlowSessionStore();
  const whitelistClient = new WhitelistClient(new WhitelistCache());
  const quoteService = new QuoteService(store, new QuoteProvider());
  const confirmationService = new ConfirmationService(store);

  app.register(cors, { origin: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ code: error.code, message: error.message, retryable: error.retryable });
    }

    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    const code = message === 'QUOTE_EXPIRED' ? 'QUOTE_EXPIRED' : message;
    const statusCode = ['GUARDIAN_BLOCKED', 'QUOTE_EXPIRED', 'INTENT_NOT_VALIDATED', 'PREVIEW_NOT_FOUND'].includes(code) ? 409 : 400;
    return reply.status(statusCode).send({ code, message, retryable: code === 'QUOTE_EXPIRED' });
  });

  app.get('/health', async () => ({ ok: true }));

  app.post('/api/intents/parse', async (request) => handleParseIntent(store, whitelistClient, request.body as Record<string, unknown>));
  app.post('/api/intents/:intentId/quote', async (request) => handleCreateQuote(store, quoteService, (request.params as { intentId: string }).intentId));
  app.post('/api/intents/:intentId/preview', async (request) => handleCreatePreview(store, (request.params as { intentId: string }).intentId, ((request.body as { language?: 'en' | 'zh' }).language ?? 'en')));
  app.post('/api/intents/:intentId/refresh', async (request) => handleRefreshQuote(store, quoteService, (request.params as { intentId: string }).intentId));
  app.post('/api/intents/:intentId/confirm', async (request) => handleConfirmPreview(store, confirmationService, (request.params as { intentId: string }).intentId, (request.body as { previewId: string }).previewId));

  return app;
}

import { clientConfig } from '../lib/config';
import type { SupportedLanguage } from './i18n';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${clientConfig.apiBaseUrl}${path}`, {
    headers,
    ...init
  });
  if (!response.ok) {
    const payload = (await response.json()) as { message?: string };
    throw new Error(payload.message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

export function parseIntent(payload: { sourceText: string; inputLanguage?: SupportedLanguage; outputLanguage?: SupportedLanguage; confirmInterpretation?: boolean }) {
  return request('/api/intents/parse', { method: 'POST', body: JSON.stringify(payload) });
}

export function createQuote(intentId: string) {
  return request(`/api/intents/${intentId}/quote`, { method: 'POST' });
}

export function createPreview(intentId: string, language: SupportedLanguage) {
  return request(`/api/intents/${intentId}/preview`, { method: 'POST', body: JSON.stringify({ language }) });
}

export function confirmPreview(intentId: string, previewId: string) {
  return request(`/api/intents/${intentId}/confirm`, { method: 'POST', body: JSON.stringify({ previewId, confirmed: true }) });
}

export function refreshQuote(intentId: string) {
  return request(`/api/intents/${intentId}/refresh`, { method: 'POST' });
}

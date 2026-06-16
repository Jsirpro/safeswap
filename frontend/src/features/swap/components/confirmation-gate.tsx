'use client';

import { labels } from '../../../services/i18n';

export function ConfirmationGate({ language, onConfirm }: { language: 'en' | 'zh'; onConfirm: () => void }) {
  return <button type="button" onClick={onConfirm}>{labels[language].confirm}</button>;
}

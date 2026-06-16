'use client';

import { labels } from '../../../services/i18n';

export function SwapEditor({ language, onEdit }: { language: 'en' | 'zh'; onEdit: () => void }) {
  return <button type="button" onClick={onEdit}>{labels[language].edit}</button>;
}

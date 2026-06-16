'use client';

import { labels } from '../../../services/i18n';

export function WalletHandoffButton({ language, onClick }: { language: 'en' | 'zh'; onClick: () => void }) {
  return <button type="button" onClick={onClick}>{labels[language].wallet}</button>;
}

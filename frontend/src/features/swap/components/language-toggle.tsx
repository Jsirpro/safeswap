'use client';

import type { SupportedLanguage } from '../../../services/i18n';

export function LanguageToggle({ value, onChange }: { value: SupportedLanguage; onChange: (value: SupportedLanguage) => void }) {
  return (
    <div>
      <button type="button" onClick={() => onChange('en')} disabled={value === 'en'}>
        English
      </button>
      <button type="button" onClick={() => onChange('zh')} disabled={value === 'zh'}>
        中文
      </button>
    </div>
  );
}

export type SupportedLanguage = 'en' | 'zh';

const messages = {
  en: {
    unsupportedAction: 'Only exact-input swaps are supported in MVP.',
    unsupportedPair: 'This asset pair is not supported by the current whitelist.',
    whitelistUnavailable: 'Asset support cannot be verified right now.',
    amountRequired: 'A positive input amount is required.',
    parseFailed: "The swap request could not be parsed. Try formats like 'Swap 10 SUI to USDC' or '把 10 SUI 换成 USDC'.",
    ambiguity: 'Please confirm the interpreted swap intent before continuing.',
    quoteExpired: 'The quote expired. Refresh the quote to continue.',
    guardianBlocked: 'Execution is blocked by guardian risk checks.',
    previewCannotExplain: 'The preview could not explain the transaction clearly enough.',
    confirmationRevoked: 'The current confirmation is no longer valid.',
    walletConsent: 'Wallet connection is not consent to sign.'
  },
  zh: {
    unsupportedAction: 'MVP 仅支持 exact-input 交换。',
    unsupportedPair: '当前白名单不支持该交易对。',
    whitelistUnavailable: '当前无法验证资产是否受支持。',
    amountRequired: '必须提供大于 0 的输入数量。',
    parseFailed: '无法解析这条交换请求。请尝试类似“Swap 10 SUI to USDC”或“把 10 SUI 换成 USDC”的格式。',
    ambiguity: '继续之前请确认系统解析出的交换意图。',
    quoteExpired: '报价已过期，请刷新后继续。',
    guardianBlocked: 'Guardian 风险检查已阻止执行。',
    previewCannotExplain: '当前预览无法足够清晰地解释交易。',
    confirmationRevoked: '当前确认状态已失效。',
    walletConsent: '连接钱包不等于同意签名。'
  }
} as const;

export function t(language: SupportedLanguage, key: keyof typeof messages.en): string {
  return messages[language][key];
}

export function detectLanguage(input: string): SupportedLanguage {
  return /[\u4e00-\u9fff]/.test(input) ? 'zh' : 'en';
}

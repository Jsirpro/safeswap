export type SupportedLanguage = 'en' | 'zh';

export const labels = {
  en: {
    title: 'SafeSwap Intent Engine',
    subtitle: 'Describe a Sui swap goal in natural language.',
    submit: 'Parse Intent',
    quote: 'Get Quote',
    preview: 'Generate Preview',
    confirm: 'Confirm And Unlock Wallet',
    edit: 'Edit Swap',
    wallet: 'Request Wallet Signature'
  },
  zh: {
    title: 'SafeSwap 意图引擎',
    subtitle: '用自然语言描述你的 Sui 交换目标。',
    submit: '解析意图',
    quote: '获取报价',
    preview: '生成预览',
    confirm: '确认并解锁钱包',
    edit: '修改交换内容',
    wallet: '请求钱包签名'
  }
} as const;

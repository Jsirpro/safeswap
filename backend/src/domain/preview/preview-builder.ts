import { randomUUID } from 'node:crypto';
import type { SupportedLanguage } from '../../lib/i18n.js';
import type { GuardianReport } from '../guardian/guardian-model.js';
import type { SwapIntent } from '../intent/intent-model.js';
import type { HumanReadablePreview, PTBArtifact } from './preview-model.js';
import type { Quote } from '../quotes/quote-model.js';

export function buildPreview(intent: SwapIntent, quote: Quote, ptb: PTBArtifact, guardian: GuardianReport, language: SupportedLanguage): HumanReadablePreview {
  const english = {
    walletOutflowText: `You will send ${intent.inputAmount} ${intent.inputAssetSymbol}.`,
    walletInflowText: `You are expected to receive ${quote.expectedOutputAmount} ${intent.outputAssetSymbol}.`,
    expectedOutputText: `Expected output: ${quote.expectedOutputAmount} ${intent.outputAssetSymbol}`,
    minimumOutputText: `Minimum output: ${quote.minimumOutputAmount} ${intent.outputAssetSymbol}`,
    routeText: `Route: ${ptb.routeSummary}`,
    failureConditionsText: 'The transaction can fail if the quote expires, guardian blocks execution, or the intent changes.'
  };
  const chinese = {
    walletOutflowText: `你将支付 ${intent.inputAmount} ${intent.inputAssetSymbol}。`,
    walletInflowText: `预计收到 ${quote.expectedOutputAmount} ${intent.outputAssetSymbol}。`,
    expectedOutputText: `预期输出：${quote.expectedOutputAmount} ${intent.outputAssetSymbol}`,
    minimumOutputText: `最小输出：${quote.minimumOutputAmount} ${intent.outputAssetSymbol}`,
    routeText: `路径：${ptb.routeSummary}`,
    failureConditionsText: '如果报价过期、Guardian 阻止执行或用户修改意图，交易将无法继续。'
  };
  const copy = language === 'zh' ? chinese : english;

  return {
    previewId: randomUUID(),
    intentId: intent.intentId,
    quoteId: quote.quoteId,
    language,
    walletOutflowText: copy.walletOutflowText,
    walletInflowText: copy.walletInflowText,
    expectedOutputText: copy.expectedOutputText,
    minimumOutputText: copy.minimumOutputText,
    routeText: copy.routeText,
    failureConditionsText: copy.failureConditionsText,
    guardianFindingsText: guardian.findings.map((finding) => finding.message),
    generatedAt: new Date().toISOString()
  };
}

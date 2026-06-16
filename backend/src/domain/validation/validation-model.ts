export type ValidationFailureCode =
  | 'UNSUPPORTED_ACTION'
  | 'UNSUPPORTED_PAIR'
  | 'WHITELIST_UNAVAILABLE'
  | 'INVALID_AMOUNT'
  | 'AMBIGUITY_REQUIRES_CONFIRMATION'
  | 'UNPARSEABLE_INTENT';

export interface ValidationResult {
  intentId: string;
  isValid: boolean;
  failureCode: ValidationFailureCode | null;
  failureMessage: string | null;
  validatedPairId: string | null;
  whitelistVersion: string;
  validatedAt: string;
}

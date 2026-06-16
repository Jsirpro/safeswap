'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SupportedLanguage } from '../../services/i18n';

export interface SwapFlowState {
  sourceText: string;
  inputLanguage: SupportedLanguage;
  outputLanguage: SupportedLanguage;
  intent: any | null;
  validation: any | null;
  quote: any | null;
  guardian: any | null;
  preview: any | null;
  walletPayload: any | null;
  error: string | null;
}

const initialState: SwapFlowState = {
  sourceText: '',
  inputLanguage: 'en',
  outputLanguage: 'en',
  intent: null,
  validation: null,
  quote: null,
  guardian: null,
  preview: null,
  walletPayload: null,
  error: null
};

const SwapContext = createContext<{
  state: SwapFlowState;
  setState: React.Dispatch<React.SetStateAction<SwapFlowState>>;
} | null>(null);

export function SwapStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  return <SwapContext.Provider value={{ state, setState }}>{children}</SwapContext.Provider>;
}

export function useSwapStore() {
  const context = useContext(SwapContext);
  if (!context) throw new Error('SwapStoreProvider missing');
  return context;
}

export { initialState };

'use client';

import { useState } from 'react';
import { requestWalletSignature } from '../../../services/sui-wallet';

export function useWalletHandoff() {
  const [signature, setSignature] = useState<string | null>(null);

  async function handoff(walletPayload: { serializedTransaction: string }) {
    const next = await requestWalletSignature(walletPayload.serializedTransaction);
    setSignature(next);
    return next;
  }

  return { signature, handoff };
}

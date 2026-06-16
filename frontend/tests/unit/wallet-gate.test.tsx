
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from '../../src/app/page';

const { parseIntent, createQuote, createPreview, confirmPreview, refreshQuote, requestWalletSignature } = vi.hoisted(() => ({
  parseIntent: vi.fn(),
  createQuote: vi.fn(),
  createPreview: vi.fn(),
  confirmPreview: vi.fn(),
  refreshQuote: vi.fn(),
  requestWalletSignature: vi.fn()
}));

vi.mock('../../src/services/intent-engine-client', () => ({
  parseIntent,
  createQuote,
  createPreview,
  confirmPreview,
  refreshQuote
}));

vi.mock('../../src/services/sui-wallet', () => ({
  requestWalletSignature
}));

describe('wallet handoff gating', () => {
  beforeEach(() => {
    parseIntent.mockReset();
    createQuote.mockReset();
    createPreview.mockReset();
    confirmPreview.mockReset();
    refreshQuote.mockReset();
    requestWalletSignature.mockReset();

    parseIntent.mockResolvedValue({
      intent: {
        intentId: 'intent-1',
        ambiguityStatus: 'clear'
      },
      validation: {
        isValid: true,
        failureMessage: null
      }
    });
    createQuote.mockResolvedValue({
      quote: { quoteId: 'quote-1', routeSummary: 'SUI -> USDC', expectedOutputAmount: '11.2', minimumOutputAmount: '11.0' },
      guardian: { overallSeverity: 'info', findings: [] }
    });
    createPreview.mockResolvedValue({
      preview: {
        previewId: 'preview-1',
        walletOutflowText: 'You will send 10 SUI.',
        walletInflowText: 'You are expected to receive 11.2 USDC.',
        expectedOutputText: 'Expected output: 11.2 USDC',
        minimumOutputText: 'Minimum output: 11.0 USDC',
        routeText: 'Route: SUI -> USDC',
        failureConditionsText: 'The transaction can fail if the quote expires.',
        guardianFindingsText: []
      }
    });
    confirmPreview.mockResolvedValue({
      walletPayload: { serializedTransaction: '{"intentId":"intent-1"}' }
    });
    refreshQuote.mockResolvedValue({
      quote: { quoteId: 'quote-2' },
      guardian: { overallSeverity: 'info', findings: [] }
    });
    requestWalletSignature.mockResolvedValue('mock-signature:23');
  });

  it('does not request a wallet signature before explicit confirmation', async () => {
    render(<Page />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Swap 10 SUI to USDC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Parse Intent' }));
    await waitFor(() => expect(createQuote).not.toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Get Quote' }));
    await waitFor(() => expect(createQuote).toHaveBeenCalledTimes(1));
    expect(requestWalletSignature).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    await waitFor(() => expect(createPreview).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: 'Request Wallet Signature' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm And Unlock Wallet' }));
    await waitFor(() => expect(confirmPreview).toHaveBeenCalledTimes(1));
    expect(requestWalletSignature).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Request Wallet Signature' }));
    await waitFor(() => expect(requestWalletSignature).toHaveBeenCalledTimes(1));
  });
});

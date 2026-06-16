
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SwapStoreProvider } from '../../src/features/swap/store';
import { SwapForm } from '../../src/features/swap/components/swap-form';

const { parseIntent } = vi.hoisted(() => ({
  parseIntent: vi.fn()
}));

vi.mock('../../src/services/intent-engine-client', () => ({
  parseIntent
}));

describe('SwapForm', () => {
  beforeEach(() => {
    parseIntent.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders API errors for failed parse requests', async () => {
    parseIntent.mockRejectedValue(new Error('Whitelist unavailable'));
    render(
      <SwapStoreProvider>
        <SwapForm />
      </SwapStoreProvider>
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Swap 10 SUI to USDC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Parse Intent' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Whitelist unavailable'));
  });

  it('switches visible copy when the user changes language manually', () => {
    parseIntent.mockResolvedValue({ intent: null, validation: null });
    render(
      <SwapStoreProvider>
        <SwapForm />
      </SwapStoreProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '中文' }));
    expect(screen.getByRole('heading').textContent).toContain('SafeSwap 意图引擎');
    expect(screen.getByRole('button', { name: '解析意图' })).toBeTruthy();
  });
});
